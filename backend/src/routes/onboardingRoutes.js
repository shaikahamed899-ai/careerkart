const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticate } = require('../middleware/auth');

// Get dropdown options (public)
router.get('/options', onboardingController.getOnboardingOptions);

// Get questions for a user type (public)
router.get('/questions', onboardingController.getOnboardingQuestions);

// Protected routes
router.use(authenticate);

// Get onboarding status
router.get('/status', onboardingController.getOnboardingStatus);

// Set user type (first step)
router.post('/user-type', onboardingController.setUserType);

// Save step answers
router.post('/step', onboardingController.saveOnboardingStep);

// Complete onboarding
router.post('/complete', onboardingController.completeOnboarding);

// Skip onboarding
router.post('/skip', onboardingController.skipOnboarding);

module.exports = router;
