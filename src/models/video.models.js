/*id string pk
  owner ObjectId[] users
  videoFile string
  thumbNail string
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date*/

import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema= new Schema(
    {
        videoFile:{
            type: String,
            required: true,
            trim: true 
        },
        thumbNail: {
            type: String,
            required: true,
            trim: true 
        },
        title:{
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        owner: [{
            type: Schema.Types.ObjectId,
            ref: 'User', // Assuming you have a User model
            required: true
        }]
    },
    {timestamps:true} // This will automatically add createdAt and updatedAt fields

)
videoSchema.plugin(mongooseAggregatePaginate);

// Export the Video model
export const Video = mongoose.model("Video", videoSchema);