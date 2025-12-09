const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const companyController = require('../controllers/companyController');
const employerController = require('../controllers/employerController');
const { authenticate, isEmployer } = require('../middleware/auth');
const { uploadCompanyLogo, uploadCompanyCover } = require('../middleware/upload');
const { validate, validations } = require('../middleware/validate');

// All routes require authentication and employer role
router.use(authenticate);
router.use(isEmployer);

// Dashboard & Analytics
router.get('/dashboard', employerController.getDashboard);
router.get('/analytics', employerController.getAnalytics);
router.get('/analytics/applications', employerController.getApplicationAnalytics);
router.get('/analytics/jobs', employerController.getJobAnalytics);

// Company management
router.get('/company', employerController.getMyCompany);
router.post('/company', companyController.createCompany);
router.put('/company', companyController.updateCompany);
router.post('/company/logo', uploadCompanyLogo, companyController.uploadLogo);
router.post('/company/cover', uploadCompanyCover, companyController.uploadCover);

// Job management
router.get('/jobs', jobController.getEmployerJobs);
router.post('/jobs', validations.createJob, validate, jobController.createJob);
router.get('/jobs/:id', jobController.getJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob);

// Application management
router.get('/applications', employerController.getAllApplications);
router.get('/jobs/:id/applications', jobController.getJobApplications);
router.put('/applications/:applicationId/status', jobController.updateApplicationStatus);
router.post('/applications/:applicationId/interview', jobController.scheduleInterview);

module.exports = router;
