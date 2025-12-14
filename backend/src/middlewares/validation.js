import { body, validationResult } from 'express-validator';

// Helper function to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
export const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('role')
    .optional()
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be either buyer or seller'),

  handleValidationErrors,
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

// Property validation
export const validateProperty = [
  body('title')
    .notEmpty()
    .withMessage('Property title is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Title must be between 10 and 100 characters'),

  body('description')
    .notEmpty()
    .withMessage('Property description is required')
    .isLength({ min: 50, max: 1000 })
    .withMessage('Description must be between 50 and 1000 characters'),

  body('type')
    .isIn(['room', 'flat', 'apartment', 'house'])
    .withMessage('Invalid property type'),

  body('price')
    .isFloat({ min: 1 })
    .withMessage('Price must be a positive number'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 50 })
    .withMessage('Location cannot exceed 50 characters'),

  body('area')
    .isFloat({ min: 1 })
    .withMessage('Area must be a positive number'),

  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),

  handleValidationErrors,
];

// Feedback validation
export const validateFeedback = [
  body('type')
    .isIn(['property_review', 'platform_feedback', 'bug_report', 'suggestion'])
    .withMessage('Invalid feedback type'),

  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters'),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('property').optional().isMongoId().withMessage('Invalid property ID'),

  handleValidationErrors,
];

// Contact form validation
export const validateContact = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+977)?[9][6-9]\d{8}$|^(\+977)?[01]\d{7}$/)
    .withMessage('Please provide a valid Nepali phone number')
    .trim(),

  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters')
    .trim(),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim(),

  body('category')
    .optional()
    .isIn([
      'General Inquiry',
      'Property Listing',
      'Technical Support',
      'Partnership',
      'Complaint',
      'Other',
    ])
    .withMessage('Invalid category'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),

  handleValidationErrors,
];

// Report validation
export const validateReport = [
  body('property')
    .notEmpty()
    .withMessage('Property is required')
    .isMongoId()
    .withMessage('Invalid property ID'),

  body('reason')
    .notEmpty()
    .withMessage('Report reason is required')
    .isIn([
      'Inappropriate Content',
      'Fake Listing',
      'Duplicate Listing',
      'Spam',
      'Incorrect Information',
      'Privacy Violation',
      'Scam/Fraud',
      'Other',
    ])
    .withMessage('Invalid report reason'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),

  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),

  body('evidence.*')
    .optional()
    .isURL()
    .withMessage('Each evidence item must be a valid URL'),

  handleValidationErrors,
];
