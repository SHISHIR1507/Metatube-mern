import express from "express";
import {
  likeContent,
  unlikeContent,
  getLikesByContent,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/like", verifyJWT, likeContent);
router.post("/unlike", verifyJWT, unlikeContent);
router.get("/:type/:contentId", getLikesByContent);

export default router;
