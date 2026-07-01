/**
 * CVPro Studio — Cloudinary Upload Utility
 * Shared helper for all controllers that need to upload files.
 * Uses multer.memoryStorage() → req.file.buffer → Cloudinary secure_url
 * Works on Vercel (no filesystem) and locally (if CLOUDINARY_CLOUD_NAME is set).
 */
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');

// ── Configure Cloudinary once ────────────────────────────────────
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

/**
 * Upload a Buffer to Cloudinary.
 * @param {Buffer} buffer  - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder name, e.g. 'cvpro-studio/proofs'
 * @returns {Promise<string>} secure_url
 */
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder || 'cvpro-studio', resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * multer instance using memoryStorage.
 * Use this in all routes — works on Vercel and localhost.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

module.exports = { uploadToCloudinary, upload };
