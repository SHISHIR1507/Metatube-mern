import express from "express";
import {
  createTweet,
  getAllTweets,
  getTweetById,
  deleteTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createTweet);
router.get("/", getAllTweets);
router.get("/:id", getTweetById);
router.delete("/:id", verifyJWT, deleteTweet);

export default router;
