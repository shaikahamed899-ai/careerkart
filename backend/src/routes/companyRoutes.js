const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, validations } = require('../middleware/validate');

// Public routes
router.get('/', companyController.getCompanies);
router.get('/filters', companyController.getCompanyFilterOptions);
router.get('/:idOrSlug', optionalAuth, companyController.getCompany);
router.get('/:idOrSlug/jobs', companyController.getCompanyJobs);
router.get('/:idOrSlug/reviews', companyController.getCompanyReviews);
router.get('/:idOrSlug/salaries', companyController.getCompanySalaries);
router.get('/:idOrSlug/interviews', companyController.getCompanyInterviews);

// Protected routes
router.use(authenticate);

// Follow/unfollow
router.post('/:id/follow', companyController.toggleFollowCompany);

// Submit content
router.post('/:id/reviews', validations.createReview, validate, companyController.submitReview);
router.post('/:id/salaries', validations.submitSalary, validate, companyController.submitSalary);
router.post('/:id/interviews', validations.submitInterview, validate, companyController.submitInterview);

module.exports = router;
