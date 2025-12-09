const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, validations } = require('../middleware/validate');

// Public routes
router.get('/insights', salaryController.getSalaryInsights);
router.get('/search', salaryController.searchSalaries);
router.get('/popular-titles', salaryController.getPopularTitles);
router.get('/filters', salaryController.getFilterOptions);
router.post('/compare', salaryController.compareSalaries);

// Protected routes
router.use(authenticate);

router.post('/', validations.submitSalary, validate, salaryController.submitSalary);
router.get('/my', salaryController.getMySalaries);

module.exports = router;
