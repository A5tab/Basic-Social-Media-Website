import { Router } from "express";
import {
    registerUser,
    loginUser,
    uploadPost,
    getPosts,
    getProfile,
    getUserFeed,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register")
    .get((req, res) => {
        res.render("signup"); // Render the signup view
    })
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser
    );
router.route("/login").get((req, res) => {
    res.render("login")
}).post(loginUser)

// secured routes

router.route("/profile/:userId").get(verifyJWT, getProfile);
router.route("/feed").get(verifyJWT, getUserFeed);
router.route("/upload").post(verifyJWT, upload.single("postPic"), uploadPost);
router.route("/getPosts").get(verifyJWT, getPosts);


export default router