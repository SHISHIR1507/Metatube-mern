import { Playlist } from '../models/playlist.models.js';
import { Video } from '../models/video.models.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and Description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Playlist created successfully",
    playlist,
  });
});


export const getAllPlaylistsOfUser = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate("videos")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    playlists,
  });
});


export const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId).populate("videos");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json({
    success: true,
    playlist,
  });
});


export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Ensure the requester owns the playlist
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to modify this playlist");
  }

  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
    await playlist.save();
  }

  res.status(200).json({
    success: true,
    message: "Video added to playlist",
    playlist,
  });
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to modify this playlist");
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId
  );

  await playlist.save();

  res.status(200).json({
    success: true,
    message: "Video removed from playlist",
    playlist,
  });
});


export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(403, "Not authorized to delete this playlist");
  }

  await playlist.deleteOne();

  res.status(200).json({
    success: true,
    message: "Playlist deleted successfully",
  });
});
