  /*id string pk
  content string
  video ObjectId videos
  owner ObjectId users
  createdAt Date
  updatedAt Date*/

import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true // Trim whitespace from the content
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video', // Assuming you have a Video model
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Assuming you have a User model
            required: true
        }
    },
    { timestamps: true } // This will automatically add createdAt and updatedAt fields
);
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentSchema);