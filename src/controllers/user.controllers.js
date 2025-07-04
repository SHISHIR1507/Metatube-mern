import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken= async (userId)=> {
    try {
        const user = await User.findById(userId)
    
        const accessToken =user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save ({validateBeforeSave: false})
    } catch (error) {
        throw new ApiError(500,"Something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    console.log("Received files:", req.files);

    if(
        [fullname, email, username, password].some((field) =>
            field?.trim() === ""
    )) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    const avatarLocalPath = req?.files?.avatar?.[0]?.path
    const coverLocalPath = req?.files?.coverImage?.[0]?.path
    console.log("Received files:", req.files);


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    /*const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = "";

    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverLocalPath);
    }*/
    
        let avatar
        try {
            avatar = await uploadOnCloudinary(avatarLocalPath);
            console.log("Avatar uploaded successfully:", avatar);
        }
        catch (error) {
            console.error("Error uploading avatar:", error);
            throw new ApiError(500, "Failed to upload avatar");
        }

        let coverImage
        try {
            coverImage = await uploadOnCloudinary(coverLocalPath);
            console.log("cover image uploaded successfully:", coverImage);
        }
        catch (error) {
            console.error("Error uploading cover image:", error);
            throw new ApiError(500, "Failed to upload cover image");
        }

        

    try {
        const user = await User.create({
            fullname,
            email,
            username: username.toLowerCase(),
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        });
    
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating user");
    
        }
        return res.status(201).json(new ApiResponse(200, createdUser , "User created successfully"));
    
    } catch (error) {
        console.log("Error creating user:")
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500, "Something went wrong while creating user and images were deleted");  
        
    }
    // Logic for registering a user
});
export { registerUser };