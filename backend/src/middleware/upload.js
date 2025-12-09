const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configure multer storage (memory storage for cloudinary upload)
const storage = multer.memoryStorage();

// File filter for resumes
const resumeFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and Word documents are allowed', 400, 'INVALID_FILE_TYPE'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, GIF, and WebP images are allowed', 400, 'INVALID_FILE_TYPE'), false);
  }
};

// Resume upload middleware
const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('resume');

// Avatar upload middleware
const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('avatar');

// Company logo upload middleware
const uploadCompanyLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
}).single('logo');

// Company cover image upload middleware
const uploadCompanyCover = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('coverImage');

// Multiple images upload
const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
}).array('images', 5);

// Verification documents upload
const uploadDocuments = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and images are allowed', 400, 'INVALID_FILE_TYPE'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).array('documents', 5);

// Wrapper to handle multer errors
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the limit', 400, 'FILE_TOO_LARGE'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadResume: handleUpload(uploadResume),
  uploadAvatar: handleUpload(uploadAvatar),
  uploadCompanyLogo: handleUpload(uploadCompanyLogo),
  uploadCompanyCover: handleUpload(uploadCompanyCover),
  uploadImages: handleUpload(uploadImages),
  uploadDocuments: handleUpload(uploadDocuments),
};
