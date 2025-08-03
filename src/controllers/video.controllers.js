// controllers/video.controller.js
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

export const uploadVideo = async (req, res) => {
  try {
    const { title, description, duration, isPublished } = req.body;
    const ownerId = req.user?._id;

    // Check if files exist
    if (!req.files || !req.files.videoFile || !req.files.thumbNail) {
      return res.status(400).json({ error: "Video and thumbnail are required" });
    }

    // Upload both files to Cloudinary
    const videoPath = req.files.videoFile[0].path;
    const thumbnailPath = req.files.thumbNail[0].path;

    const videoUpload = await uploadOnCloudinary(videoPath);
    const thumbUpload = await uploadOnCloudinary(thumbnailPath);

    if (!videoUpload || !thumbUpload) {
      return res.status(500).json({ error: "Failed to upload files" });
    }

    const newVideo = await Video.create({
      videoFile: videoUpload.secure_url,
      thumbNail: thumbUpload.secure_url,
      title,
      description,
      duration,
      isPublished: isPublished || false,
      owner: [ownerId],
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      data: newVideo,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, duration, isPublished } = req.body;
    const userId = req.user?._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Ownership check
    if (!video.owner.includes(userId.toString())) {
      return res.status(403).json({ error: "You are not allowed to edit this video" });
    }

    // Optional: Update thumbnail
    if (req.file) {
      const thumbUpload = await uploadOnCloudinary(req.file.path);
      if (!thumbUpload) {
        return res.status(500).json({ error: "Thumbnail upload failed" });
      }
      video.thumbNail = thumbUpload.secure_url;
    }

    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (duration) video.duration = duration;
    if (typeof isPublished !== 'undefined') video.isPublished = isPublished;

    await video.save();

    res.status(200).json({
      message: "Video updated successfully",
      data: video
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if the logged-in user is the owner
    if (!video.owner.includes(userId.toString())) {
      return res.status(403).json({ error: "You are not authorized to delete this video" });
    }

    await video.deleteOne();

    res.status(200).json({
      message: "Video deleted successfully",
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllPublishedVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isPublished: true })
    .sort({ createdAt: -1 }) // latest first
    .populate("owner", "username avatar");

  res.status(200).json({
    success: true,
    message: "All published videos",
    data: videos
  });
});

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findOne({ _id: id, isPublished: true })
    .populate("owner", "username avatar");

  if (!video) {
    return res.status(404).json({
      success: false,
      message: "Video not found or not published"
    });
  }

  res.status(200).json({
    success: true,
    message: "Video found",
    data: video
  });
});
