const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { generateToken } = require('../utils/encryption');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { sanitizeUser } = require('../utils/helpers');
const config = require('../config');

// Email normalization function
function normalizeEmail(email) {
  if (!email) return email;
  
  const normalized = email.toLowerCase().trim();
  
  // Handle Gmail addresses - remove dots from username
  if (normalized.includes('@gmail.com')) {
    const [username, domain] = normalized.split('@');
    return `${username.replace(/\./g, '')}@${domain}`;
  }
  
  return normalized;
}

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role = 'job_seeker' } = req.body;
    
    // Normalize email (handle Gmail dots and case)
    const normalizedEmail = normalizeEmail(email);
    
    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
    }
    
    // Create user
    const user = new User({
      email: normalizedEmail,
      password,
      name,
      role,
      authProvider: 'local',
    });
    
    // Generate email verification token
    const verificationToken = generateToken(32);
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await user.save();
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Save refresh token
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check if user registered with social login
    if (user.authProvider !== 'local' && !user.password) {
      throw new AppError(
        `Please login with ${user.authProvider}`,
        400,
        'SOCIAL_LOGIN_REQUIRED'
      );
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }
    
    if (user.isBanned) {
      throw new AppError('Account is banned', 403, 'ACCOUNT_BANNED');
    }
    
    // Update last login
    user.lastLogin = new Date();
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });
    
    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Save refresh token
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    // Clean up expired refresh tokens
    user.refreshTokens = user.refreshTokens.filter(
      (t) => new Date(t.expiresAt) > new Date()
    );
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new AppError('Authentication failed', 401, 'AUTH_FAILED');
    }
    
    // Generate tokens
    const tokens = generateTokens(user);
    
    // Save refresh token
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    
    // Check if user needs role selection (new Google user without onboarding)
    const needsRoleSelection = user.authProvider === 'google' && !user.isOnboarded && user.role === 'job_seeker';
    
    // Redirect to frontend with tokens and role selection flag
    const redirectUrl = `${config.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&needsRoleSelection=${needsRoleSelection}&isNewUser=${!user.isOnboarded}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

// Update user role after Google registration
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = req.user;
    
    if (!['job_seeker', 'employer'].includes(role)) {
      throw new AppError('Invalid role', 400, 'INVALID_ROLE');
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400, 'REFRESH_TOKEN_REQUIRED');
    }
    
    // Verify refresh token
    const user = await verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    user.refreshTokens.push({
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    
    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;
    
    if (refreshToken) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Logout from all devices
exports.logoutAll = async (req, res, next) => {
  try {
    const user = req.user;
    
    user.refreshTokens = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('employer.companyId', 'name logo')
      .populate('savedJobs', 'title company')
      .populate('followingCompanies', 'name logo');
    
    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
    
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.isEmailVerified) {
      throw new AppError('Email already verified', 400, 'ALREADY_VERIFIED');
    }
    
    // Generate new token
    const verificationToken = generateToken(32);
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    
    await sendVerificationEmail(user.email, user.name, verificationToken);
    
    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If email exists, password reset link will be sent',
      });
    }
    
    // Generate reset token
    const resetToken = generateToken(32);
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    res.json({
      success: true,
      message: 'If email exists, password reset link will be sent',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
    }
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
