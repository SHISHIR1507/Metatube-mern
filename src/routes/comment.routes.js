import express from "express";
import { addComment, getCommentsByVideoId, updateComment, deleteComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, addComment);
router.get("/:videoId", getCommentsByVideoId);
router.put("/:commentId", verifyJWT, updateComment);
router.delete("/:commentId", verifyJWT, deleteComment);

export default router;
