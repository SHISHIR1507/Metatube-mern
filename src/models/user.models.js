  /*id string pk
  username  string 
  email string 
  fullName string
  avatar string
  coverImage string
  watchHistory ObjectId[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date*/

import mongoose from 'mongoose';
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true

        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinery url
            required: true
        },
        coverImage: {
            type: String, //cloudinery url
            
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video' // Assuming you have a Video model

            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
        {timestamps: true} // Automatically adds createdAt and updatedAt fields
);



export const User = mongoose.model("User", userSchema);