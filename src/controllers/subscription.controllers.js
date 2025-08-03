import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const subscribeToChannel = async (req, res, next) => {
  try {
    const subscriberId = req.user._id;
    const { channelId } = req.body;

    if (subscriberId.toString() === channelId) {
      throw new ApiError(400, "You cannot subscribe to yourself.");
    }

    const existing = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });
    if (existing) {
      throw new ApiError(400, "Already subscribed.");
    }

    const subscription = await Subscription.create({ subscriber: subscriberId, channel: channelId });

    return res.status(201).json(
      new ApiResponse(201, subscription, "Subscribed successfully")
    );
  } catch (error) {
    next(error);
  }
};


export const unsubscribeFromChannel = async (req, res, next) => {
  try {
    const subscriberId = req.user._id;
    const { channelId } = req.params;

    const removed = await Subscription.findOneAndDelete({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (!removed) {
      throw new ApiError(404, "Subscription not found");
    }

    return res.status(200).json(
      new ApiResponse(200, removed, "Unsubscribed successfully")
    );
  } catch (error) {
    next(error);
  }
};


export const getSubscriberCount = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const count = await Subscription.countDocuments({ channel: channelId });

    return res.status(200).json(
      new ApiResponse(200, { count }, "Subscriber count fetched")
    );
  } catch (error) {
    next(error);
  }
};


export const isSubscribed = async (req, res, next) => {
  try {
    const subscriberId = req.user._id;
    const { channelId } = req.params;

    const exists = await Subscription.findOne({ subscriber: subscriberId, channel: channelId });

    return res.status(200).json(
      new ApiResponse(200, { subscribed: !!exists }, "Subscription status fetched")
    );
  } catch (error) {
    next(error);
  }
};


export const getSubscribedChannels = async (req, res, next) => {
  try {
    const subscriberId = req.user._id;

    const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel", "username avatar");

    return res.status(200).json(
      new ApiResponse(200, channels, "Subscribed channels fetched")
    );
  } catch (error) {
    next(error);
  }
};
