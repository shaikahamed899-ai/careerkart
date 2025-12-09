const cloudinary = require('cloudinary').v2;
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const defaultOptions = {
      resource_type: 'auto',
      folder: 'careerkart',
    };
    
    const uploadOptions = { ...defaultOptions, ...options };
    
    // Convert buffer to base64
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64, uploadOptions);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('Failed to upload file', 500, 'UPLOAD_FAILED');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw error for delete failures
    return null;
  }
};

// Upload resume
const uploadResume = async (file, userId) => {
  return uploadToCloudinary(file, {
    folder: `careerkart/resumes/${userId}`,
    resource_type: 'raw',
    format: file.originalname.split('.').pop(),
    public_id: `resume_${Date.now()}`,
  });
};

// Upload avatar
const uploadAvatar = async (file, userId) => {
  return uploadToCloudinary(file, {
    folder: `careerkart/avatars`,
    public_id: `avatar_${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { format: 'webp' },
    ],
  });
};

// Upload company logo
const uploadCompanyLogo = async (file, companyId) => {
  return uploadToCloudinary(file, {
    folder: `careerkart/companies/${companyId}`,
    public_id: `logo_${companyId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fit' },
      { quality: 'auto' },
      { format: 'webp' },
    ],
  });
};

// Upload company cover image
const uploadCompanyCover = async (file, companyId) => {
  return uploadToCloudinary(file, {
    folder: `careerkart/companies/${companyId}`,
    public_id: `cover_${companyId}`,
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto' },
      { format: 'webp' },
    ],
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadResume,
  uploadAvatar,
  uploadCompanyLogo,
  uploadCompanyCover,
};
