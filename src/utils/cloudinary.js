import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!fs.existsSync(localFilePath)) {
            throw new Error("File does not exist");
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect the resource type (image/video)
        });
        console.log("File uploaded successfully:", response);
        // Delete the file from local storage after upload
        // This is optional, depending on whether you want to keep the file locally or not
        // fs.unlinkSync(localFilePath);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // delete the file from local storage
        return null;
    }
};
const deleteFromCloudinary = async (publicId) => {
    try {
        const result= await cloudinary.uploader.destroy(publicId)
    }catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}; 