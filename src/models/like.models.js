/*id string pk
  comment ObjectId comments
  video ObjectId videos
  likedBy ObjectId users
  tweet ObjectId tweets
  createdAt Date
  updatedAt Date*/

import mongoose, {Schema} from 'mongoose'
const likeSchema = new Schema(
    {
        comment:{
            type: Schema.Types.ObjectId,
            ref: 'Comment' // Assuming you have a Comment model
        },
        video:{
            type:Schema.Types.ObjectId,
            ref: 'Video' // Assuming you have a Video model

        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref: 'User' // Assuming you have a User model
        },
        tweet:{
            type: Schema.Types.ObjectId,
            ref: 'Tweet' // Assuming you have a Tweet model
        }
    },
    {timestamps: true} // This will automatically add createdAt and updatedAt fields
)
export const Like = mongoose.model("Like", likeSchema);