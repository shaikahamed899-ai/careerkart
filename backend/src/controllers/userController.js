const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { sanitizeUser } = require('../utils/helpers');
const { uploadAvatar, uploadResume, deleteFromCloudinary } = require('../utils/cloudinary');
const pdfParse = require('pdf-parse');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('employer.companyId', 'name logo')
      .populate('savedJobs')
      .populate('followingCompanies', 'name logo');
    
    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'profile',
      'preferences',
    ];
    
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // Recalculate profile completion
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload an image', 400, 'NO_FILE');
    }
    
    const user = await User.findById(req.user._id);
    
    // Delete old avatar if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`careerkart/avatars/${publicId}`);
    }
    
    // Upload new avatar
    const result = await uploadAvatar(req.file, req.user._id);
    
    user.avatar = result.url;
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: result.url },
    });
  } catch (error) {
    next(error);
  }
};

// Upload resume
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Please upload a resume', 400, 'NO_FILE');
    }
    
    const user = await User.findById(req.user._id);
    
    // Delete old resume if exists
    if (user.resume?.publicId) {
      await deleteFromCloudinary(user.resume.publicId, 'raw');
    }
    
    // Upload new resume
    const result = await uploadResume(req.file, req.user._id);
    
    // Parse resume if PDF
    let parsedData = {};
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        parsedData = {
          text: pdfData.text,
          pages: pdfData.numpages,
        };
      } catch (parseError) {
        console.error('PDF parsing error:', parseError);
      }
    }
    
    user.resume = {
      url: result.url,
      publicId: result.publicId,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
      parsedData,
    };
    
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: {
          url: result.url,
          fileName: req.file.originalname,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete resume
exports.deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.resume?.publicId) {
      throw new AppError('No resume to delete', 400, 'NO_RESUME');
    }
    
    await deleteFromCloudinary(user.resume.publicId, 'raw');
    
    user.resume = undefined;
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Add education
exports.addEducation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.education.push(req.body);
    user.calculateProfileCompletion();
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      data: user.education,
    });
  } catch (error) {
    next(error);
  }
};

// Update education
exports.updateEducation = async (req, res, next) => {
  try {
    const { educationId } = req.params;
    const user = await User.findById(req.user._id);
    
    const education = user.education.id(educationId);
    if (!education) {
      throw new AppError('Education not found', 404, 'NOT_FOUND');
    }
    
    Object.assign(education, req.body);
    await user.save();
    
    res.json({
      success: true,
      message: 'Education updated successfully',
      data: user.education,
    });
  } catch (error) {
    next(error);
  }
};

// Delete education
exports.deleteEducation = async (req, res, next) => {
  try {
    const { educationId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.education.pull(educationId);
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Education deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Add experience
exports.addExperience = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.experience.push(req.body);
    user.calculateProfileCompletion();
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// Update experience
exports.updateExperience = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const user = await User.findById(req.user._id);
    
    const experience = user.experience.id(experienceId);
    if (!experience) {
      throw new AppError('Experience not found', 404, 'NOT_FOUND');
    }
    
    Object.assign(experience, req.body);
    await user.save();
    
    res.json({
      success: true,
      message: 'Experience updated successfully',
      data: user.experience,
    });
  } catch (error) {
    next(error);
  }
};

// Delete experience
exports.deleteExperience = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.experience.pull(experienceId);
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update skills
exports.updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    const user = await User.findById(req.user._id);
    
    user.profile.skills = skills;
    user.calculateProfileCompletion();
    await user.save();
    
    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: user.profile.skills,
    });
  } catch (error) {
    next(error);
  }
};

// Get saved jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedJobs',
        populate: {
          path: 'company',
          select: 'name logo',
        },
      });
    
    res.json({
      success: true,
      data: user.savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// Save/unsave job
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user._id);
    
    const isSaved = user.savedJobs.includes(jobId);
    
    if (isSaved) {
      user.savedJobs.pull(jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: isSaved ? 'Job removed from saved' : 'Job saved successfully',
      data: { isSaved: !isSaved },
    });
  } catch (error) {
    next(error);
  }
};

// Get public profile
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select(
      'name avatar profile.headline profile.location profile.skills profile.totalExperience education experience'
    );
    
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    
    // Check privacy settings
    if (user.preferences?.profileVisibility === 'private') {
      throw new AppError('Profile is private', 403, 'PRIVATE_PROFILE');
    }
    
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.preferences = {
      ...user.preferences,
      ...req.body,
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

// Deactivate account
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
