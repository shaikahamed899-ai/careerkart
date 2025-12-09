const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const onboardingRoutes = require('./onboardingRoutes');
const jobRoutes = require('./jobRoutes');
const companyRoutes = require('./companyRoutes');
const notificationRoutes = require('./notificationRoutes');
const networkRoutes = require('./networkRoutes');
const interviewRoutes = require('./interviewRoutes');
const salaryRoutes = require('./salaryRoutes');
const employerRoutes = require('./employerRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/jobs', jobRoutes);
router.use('/companies', companyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/network', networkRoutes);
router.use('/interviews', interviewRoutes);
router.use('/salaries', salaryRoutes);
router.use('/employer', employerRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'CareerKart API',
    version: '1.0.0',
    description: 'Job portal API with authentication, jobs, companies, and more',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      onboarding: '/api/onboarding',
      jobs: '/api/jobs',
      companies: '/api/companies',
      notifications: '/api/notifications',
      network: '/api/network',
      interviews: '/api/interviews',
      salaries: '/api/salaries',
      employer: '/api/employer',
    },
  });
});

module.exports = router;
