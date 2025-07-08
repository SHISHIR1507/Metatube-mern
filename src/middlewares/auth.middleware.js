import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _,next) => {
    const token=req.cookies.accessToken || req.header.authorization?.replace("Bearer","");
    if (!token) {
        throw new ApiError(401, "You are not authorized to access this resource");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized access");
        
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
})
