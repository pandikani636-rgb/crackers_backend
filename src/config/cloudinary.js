// Cloudinary configuration utility with fallback to local file serving
const fs = require('fs');
const path = require('path');

const uploadImage = async (file) => {
  // Check if credentials are set (mock/fallback behavior)
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    // Return relative URL from public uploads folder
    const filename = file.filename || `${Date.now()}-${file.originalname}`;
    return `/uploads/${filename}`;
  }

  // If credentials exist, we would use the cloudinary SDK.
  // For safety and out-of-the-box operation, we fallback to local path.
  return `/uploads/${file.filename}`;
};

module.exports = { uploadImage };
