const { validationResult, body, param, query } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  
  next();
};

// Common validation rules
const validations = {
  // Auth validations
  register: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
  ],
  
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  
  // Profile validations
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('profile.headline')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Headline must not exceed 200 characters'),
    body('profile.summary')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Summary must not exceed 2000 characters'),
  ],
  
  // Job validations
  createJob: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Job title must be between 5 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 100, max: 10000 })
      .withMessage('Description must be between 100 and 10000 characters'),
    body('employmentType')
      .isIn(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
      .withMessage('Invalid employment type'),
    body('workMode')
      .isIn(['onsite', 'remote', 'hybrid'])
      .withMessage('Invalid work mode'),
    body('location.city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('City is required for non-remote jobs'),
    body('experience.min')
      .optional()
      .isInt({ min: 0, max: 50 })
      .withMessage('Minimum experience must be between 0 and 50 years'),
    body('salary.min')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum salary must be a positive number'),
    body('skills')
      .isArray({ min: 1 })
      .withMessage('At least one skill is required'),
  ],
  
  // Application validations
  applyJob: [
    body('coverLetter')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Cover letter must not exceed 5000 characters'),
  ],
  
  // Review validations
  createReview: [
    body('ratings.overall')
      .isInt({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('title')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    body('pros')
      .trim()
      .isLength({ min: 50, max: 3000 })
      .withMessage('Pros must be between 50 and 3000 characters'),
    body('cons')
      .trim()
      .isLength({ min: 50, max: 3000 })
      .withMessage('Cons must be between 50 and 3000 characters'),
    body('jobTitle')
      .trim()
      .notEmpty()
      .withMessage('Job title is required'),
    body('employmentStatus')
      .isIn(['current', 'former'])
      .withMessage('Employment status must be current or former'),
  ],
  
  // Salary validations
  submitSalary: [
    body('baseSalary.amount')
      .isInt({ min: 0 })
      .withMessage('Base salary must be a positive number'),
    body('jobTitle')
      .trim()
      .notEmpty()
      .withMessage('Job title is required'),
    body('totalCompensation')
      .isInt({ min: 0 })
      .withMessage('Total compensation must be a positive number'),
  ],
  
  // Interview experience validations
  submitInterview: [
    body('jobTitle')
      .trim()
      .notEmpty()
      .withMessage('Job title is required'),
    body('experience')
      .isIn(['positive', 'negative', 'neutral'])
      .withMessage('Experience must be positive, negative, or neutral'),
    body('difficulty')
      .isInt({ min: 1, max: 5 })
      .withMessage('Difficulty must be between 1 and 5'),
  ],
  
  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  
  // MongoDB ObjectId
  objectId: (field) => [
    param(field)
      .isMongoId()
      .withMessage(`Invalid ${field}`),
  ],
};

module.exports = {
  validate,
  validations,
  body,
  param,
  query,
};
