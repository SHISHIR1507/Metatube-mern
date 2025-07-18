/*id string pk
  name string
  desccription string
  videos ObjectId videos
  owner ObjectId users
  createdAt Date
  updatedAt Date*/

import mongoose from 'mongoose'
const playlistSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
            trim: true,
    },
        description:{
            type : String,
            required: true,
            trim: true,
    },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {timestamps: true}
)
export const Playlist = mongoose.model("Playlist", playlistSchema);