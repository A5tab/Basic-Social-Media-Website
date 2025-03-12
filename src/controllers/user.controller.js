import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Post } from "../models/post.models.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // save method to save user in db after entering his reftoken and when db want to save it will also want required fields so we use validateBeforeSave : false inside save method

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

// const registerUser = asyncHandler(async (req, res) => {
//     const { fullName, email, username, password } = req.body
//     if (
//         [fullName, email, username, password].some((field) =>
//             field?.trim() === ""
//         )
//     ) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const existedUser = await User.findOne({
//         $or: [{ username }, { email }]
//     })

//     if (existedUser) {
//         throw new ApiError(409, "User with email or username already exists")
//     }

//     const avatarLocalPath = req.files?.avatar[0]?.path
//     // const coverImageLocalPath = req.files?.coverImage[0]?.path

//     let coverImageLocalPath;
//     if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//         coverImageLocalPath = req.files.coverImage[0].path
//     }


//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if (!avatar) {
//         throw new ApiError(400, "Avatar file is required")
//     }

//     const user = await User.create({
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     })

//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//     ) // excluding fields from response using select

//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user")
//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User registered successfully")
//     )

// })
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Check for required fields
    if ([fullName, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if the user already exists
    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Initialize paths to undefined to handle cases where files might not exist
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath;
    if (req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    let avatar, coverImage;
    try {
        // Upload avatar and cover image to Cloudinary if they exist
        avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : { url: "" };
        coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : { url: "" };
    } catch (error) {
        throw new ApiError(500, "Error uploading images");
    }

    // Create new user
    const user = await User.create({
        fullName,
        avatar: avatar.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Generate tokens and save refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Set cookies and redirect to profile page
    res
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .redirect(`/api/v1/users/profile/${user._id}`);
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(401, "user doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        // .json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"))
        .redirect(`/api/v1/users/profile/${user._id}`);
})

const uploadPost = asyncHandler(async (req, res) => {
    const { postText } = req.body;

    if (!postText) {
        throw new ApiError(400, "Post text is required");
    }

    const user = req.user;
    const postPicLocalPath = req.file?.path; // Accessing the uploaded file's path
    let postPicUrl = "";

    if (postPicLocalPath) {
        const postPic = await uploadOnCloudinary(postPicLocalPath);
        postPicUrl = postPic.url || "";
    }

    const post = await Post.create({
        owner: user._id,
        postText: postText,
        postPic: postPicUrl
    });

    if (!post) {
        throw new ApiError(501, "Error while creating post");
    }

    user.user_posts.push(post._id);
    await user.save();

    const populatedPost = await Post.findById(post._id).populate('owner', 'username');

    res.status(200).redirect(`/api/v1/users/profile/${user._id}`)
        .json(new ApiResponse(200, populatedPost, "Post created successfully"));
});


const getPosts = asyncHandler(async (req, res) => {
    const user = req.user;
    const profileUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate('user_posts'); // Assuming `user_posts` references the posts made by the user

    if (!profileUser) {
        throw new ApiError(501, "Trouble loading user profile");
    }

    res.status(200).json(new ApiResponse(200, profileUser.user_posts, "User fetched successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId)
        .select("-password -refreshToken")
        .populate('user_posts');

    if (!user) {
        res.render('error');
        throw new ApiError(404, "User not found");
    }

    res.render('profile', { user });
});

const getUserFeed = asyncHandler(async (req, res) => {
    try {
        // Fetch all posts, regardless of the owner
        const posts = await Post.find({})
            .populate('owner', 'username avatar')
            .sort({ createdAt: -1 });

        res.render('feed', { user: req.user, posts });
    } catch (error) {
        console.error("Error in getUserFeed:", error);
        res.status(500).send('Server Error');
    }
});




export {
    registerUser,
    loginUser,
    getPosts,
    uploadPost,
    getProfile,
    getUserFeed,
}