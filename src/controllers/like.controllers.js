import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper to validate content type
const isValidType = (type) => ['video', 'comment', 'tweet'].includes(type);

export const likeContent = async (req, res) => {
  const { type, contentId } = req.body;
  const userId = req.user._id;

  if (!isValidType(type)) {
    throw new ApiError(400, "Invalid content type to like");
  }

  if (!contentId) {
    throw new ApiError(400, "Content ID is required");
  }

  const query = { likedBy: userId, [type]: contentId };

  const existingLike = await Like.findOne(query);
  if (existingLike) {
    throw new ApiError(409, "Already liked");
  }

  const newLike = await Like.create({ likedBy: userId, [type]: contentId });

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Content liked successfully"));
};

export const unlikeContent = async (req, res) => {
  const { type, contentId } = req.body;
  const userId = req.user._id;

  if (!isValidType(type)) {
    throw new ApiError(400, "Invalid content type to unlike");
  }

  const query = { likedBy: userId, [type]: contentId };

  const deleted = await Like.findOneAndDelete(query);

  if (!deleted) {
    throw new ApiError(404, "Like not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Content unliked successfully"));
};

export const getLikesByContent = async (req, res) => {
  const { type, contentId } = req.params;

  if (!isValidType(type)) {
    throw new ApiError(400, "Invalid content type");
  }

  const likes = await Like.find({ [type]: contentId }).populate("likedBy", "username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, likes, "Likes fetched successfully"));
};
