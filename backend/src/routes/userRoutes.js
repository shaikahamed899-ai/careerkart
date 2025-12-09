const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { uploadResume, uploadAvatar } = require('../middleware/upload');
const { validate, validations } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validations.updateProfile, validate, userController.updateProfile);
router.put('/preferences', userController.updatePreferences);

// Avatar
router.post('/avatar', uploadAvatar, userController.uploadAvatar);

// Resume
router.post('/resume', uploadResume, userController.uploadResume);
router.delete('/resume', userController.deleteResume);

// Education
router.post('/education', userController.addEducation);
router.put('/education/:educationId', userController.updateEducation);
router.delete('/education/:educationId', userController.deleteEducation);

// Experience
router.post('/experience', userController.addExperience);
router.put('/experience/:experienceId', userController.updateExperience);
router.delete('/experience/:experienceId', userController.deleteExperience);

// Skills
router.put('/skills', userController.updateSkills);

// Saved jobs
router.get('/saved-jobs', userController.getSavedJobs);
router.post('/saved-jobs/:jobId', userController.toggleSaveJob);

// Public profile (can be accessed by others)
router.get('/:userId', userController.getPublicProfile);

// Account
router.post('/deactivate', userController.deactivateAccount);

module.exports = router;
