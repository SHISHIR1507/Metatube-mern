import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required to create a tweet");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

export const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find()
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "All tweets fetched"));
});


export const getTweetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tweet = await Tweet.findById(id).populate("owner", "username avatar");

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet found"));
});


export const deleteTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tweet = await Tweet.findById(id);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await tweet.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});
