// routes/video.routes.js
import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadVideo } from '../controllers/video.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { updateVideo } from '../controllers/video.controllers.js';
import { deleteVideo } from '../controllers/video.controllers.js';
import { getAllPublishedVideos, getVideoById } from '../controllers/video.controllers.js';
const router = express.Router();

// 👇 Multer will handle 2 files - video and thumbnail
router.post(
  '/upload',
  verifyJWT,
  upload.fields([
    { name: 'videoFile', maxCount: 1 },
    { name: 'thumbNail', maxCount: 1 },
  ]),
  uploadVideo
);
router.patch(
  '/:videoId',
  verifyJWT,
  upload.single('thumbNail'),
  updateVideo
);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.get("/", getAllPublishedVideos);           // /videos
router.get("/:id", getVideoById);                 // /videos/:id


export default router;
