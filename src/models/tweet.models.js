/*id string pk
  owner  ObjectId users
  content string
  createdAt Date
  updatedAt Date*/
import mongoose from 'mongoose';
const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim : true // Trim whitespace from the content

        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:'User' // Assuming you have a User model
        }
    },
    {timestamps: true} // This will automatically add createdAt and updatedAt fields
);

export const Tweet = mongoose.model("Tweet", tweetSchema);