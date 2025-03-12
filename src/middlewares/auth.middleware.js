import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js"

export const verifyJWT = asyncHandler(async (req, _, next) => { // when res is not used so replaced by an underscore
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // maybe app is on mobile so that no cookie is accessible so user sending custom header which includes Authorization header
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user; // so we can access user when and where needed. This is injected in middleware so we can get current user when we want.
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})


