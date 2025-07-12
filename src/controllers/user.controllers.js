import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken= async (userId)=> {
    try {
        const user = await User.findById(userId)
        //small check to ensure user exists
        if (!user) {
            throw new ApiError(404, "User not found");
        }
    
        const accessToken =user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save ({validateBeforeSave: false})
        return {accessToken,refreshToken}
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

const loginUser = asyncHandler(async (req, res) => {
    //get data from request body
    const { email,username , password } = req.body;

    //validatn
    if (!email) {
        throw new ApiError(400,"Email is required")
    }
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password");
    }
    
    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
    }
    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, 
        {user: loggedInUser, accessToken, refreshToken},
        "User logged in successfully"
    ));

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
            }
        },
        {new: true}
    )
    const options ={
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json( new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken|| req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(404, "invalid refresh token");
        }
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set to true in production
        }
        const {accessToken,refreshToken: newRefreshToken} = 
        await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie ("accessToken", accessToken, options)
        .cookie ("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token");
    }
});

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(401,"Old password is incorrect")
    }
    user.password=newPassword
    await user.save({validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json( new ApiResponse(200,req.user,"Current user details"))
})


const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email){
        throw new ApiError(400, "Fullname and email are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "User details updated successfully"));
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url) {
        throw new ApiError(500, "Failed to upload cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});


const getUserChannelProfile = asyncHandler(async (req, res) => {

    const {username}=req.params
    if(!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {   
                subscriberCount: 
                {
                     $size: "$subscribers" 
            },
                channelsSubscribedToCount: 
                {
                     $size: "$subscribedTo" 
                    },
            
            
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                email: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            
            }
        }
    ])
    if(!channel.length) {
        throw new ApiError(404, "Channel not found");
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel profile fetched successfully"));


})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user=await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistoryVideos",
            pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                            $addFields: {
                                owner: {
                                    $first: "$ownerDetails"
                                }
                            }
                        }
                    
                ]
            }
        },
    ])

    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistoryVideos, "Watch history fetched successfully"));

})
export { registerUser, loginUser, refreshAccessToken ,logoutUser , changeCurrentPassword,getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory };