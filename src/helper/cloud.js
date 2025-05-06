// helper/cloud.js
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadToCloud = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Congozi Images",
      use_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload to Cloudinary");
  }
};
