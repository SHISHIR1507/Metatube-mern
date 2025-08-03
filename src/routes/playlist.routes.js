
import express from 'express';
import {
  createPlaylist,
  getAllPlaylistsOfUser,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist
} from '../controllers/playlist.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/', createPlaylist);
router.get('/', getAllPlaylistsOfUser);
router.get('/:playlistId', getPlaylistById);
router.put('/:playlistId/add', addVideoToPlaylist);
router.put('/:playlistId/remove', removeVideoFromPlaylist);
router.delete('/:playlistId', deletePlaylist);

export default router;
