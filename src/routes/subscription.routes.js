import express from "express";
import {
  subscribeToChannel,
  unsubscribeFromChannel,
  getSubscriberCount,
  isSubscribed,
  getSubscribedChannels
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, subscribeToChannel);
router.delete("/:channelId", verifyJWT, unsubscribeFromChannel);
router.get("/count/:channelId", getSubscriberCount);
router.get("/status/:channelId", verifyJWT, isSubscribed);
router.get("/my-channels", verifyJWT, getSubscribedChannels);

export default router;
