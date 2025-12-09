const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, validations, body } = require('../middleware/validate');

// Public routes
router.post('/register', validations.register, validate, authController.register);
router.post('/login', validations.login, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', 
  body('email').isEmail().withMessage('Valid email required'),
  validate,
  authController.forgotPassword
);
router.post('/reset-password',
  body('token').notEmpty().withMessage('Token required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  authController.resetPassword
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

// Protected routes
router.use(authenticate);

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/update-role', authController.updateRole);
router.post('/change-password',
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate,
  authController.changePassword
);

module.exports = router;
