// Backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shopeasy/products',
          resource_type: 'auto',
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 500,
    height: 500,
    crop: 'fill',
    quality: 'auto',
    format: 'webp',
  };
  
  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

export default cloudinary;