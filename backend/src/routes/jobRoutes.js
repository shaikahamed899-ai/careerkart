const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, validations } = require('../middleware/validate');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, jobController.getJobs);
router.get('/filters', jobController.getFilterOptions);
router.get('/search', optionalAuth, jobController.searchJobs);
router.get('/:id', optionalAuth, jobController.getJob);
router.get('/:id/similar', jobController.getSimilarJobs);

// Protected routes
router.use(authenticate);

// Recommended jobs (requires auth for personalization)
router.get('/recommended/for-you', jobController.getRecommendedJobs);

// Applications
router.post('/:id/apply', validations.applyJob, validate, jobController.applyForJob);
router.get('/applications/my', jobController.getMyApplications);
router.post('/applications/:applicationId/withdraw', jobController.withdrawApplication);

module.exports = router;
