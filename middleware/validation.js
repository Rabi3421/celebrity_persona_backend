const { body, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, 'Validation failed', 400, errors.array());
  }
  next();
};

const validateOutfit = [
  body('title').notEmpty().withMessage('Outfit title is required'),
  body('description').optional().isLength({ max: 5000000 }),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('affiliateLink').isURL().withMessage('Must be a valid URL'),
  body('celebrity').isMongoId().withMessage('Valid celebrity ID required'),
  validateRequest
];

const validateCelebrity = [
  body('name').notEmpty().withMessage('Celebrity name is required'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('instagramHandle').optional().matches(/^@?[a-zA-Z0-9_.]+$/).withMessage('Invalid Instagram handle'),
  body('profession').optional().isString(),
  body('category').optional().isString(),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase with hyphens'),
  validateRequest
];

const validateBlog = [
  body('title').notEmpty().withMessage('Blog title is required'),
  body('content').notEmpty().withMessage('Blog content is required'),
  body('excerpt').optional().isLength({ max: 300 }).withMessage('Excerpt must be less than 300 characters'),
  body('category').notEmpty().withMessage('Blog category is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('published').optional().isBoolean().withMessage('Published must be boolean'),
  body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase with hyphens'),
  body('relatedCelebrities').optional().isArray().withMessage('Related celebrities must be an array'),
  validateRequest
];

const validateAdminLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const validateAdminCreate = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'super_admin', 'moderator']).withMessage('Invalid role'),
  validateRequest
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validateRequest
];

const validateContentModeration = [
  body('type').isIn(['blog', 'outfit', 'celebrity']).withMessage('Invalid content type'),
  body('id').isMongoId().withMessage('Valid content ID required'),
  body('action').isIn(['approve', 'reject', 'feature']).withMessage('Invalid action'),
  validateRequest
];

const validateTrackClick = [
  body('type').isIn(['celebrity', 'outfit', 'blog', 'affiliate_link', 'external_link']).withMessage('Invalid track type'),
  body('targetId').optional().isMongoId().withMessage('Invalid target ID'),
  body('url').optional().isURL().withMessage('Invalid URL'),
  body('userId').optional().isString().withMessage('User ID must be string'),
  body('sessionId').optional().isString().withMessage('Session ID must be string'),
  validateRequest
];

const validateTrackPageView = [
  body('page').notEmpty().withMessage('Page is required'),
  body('url').optional().isURL().withMessage('Invalid URL'),
  body('userId').optional().isString().withMessage('User ID must be string'),
  body('sessionId').optional().isString().withMessage('Session ID must be string'),
  body('duration').optional().isNumeric().withMessage('Duration must be numeric'),
  validateRequest
];

const validateTrackEvent = [
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventCategory').optional().isString().withMessage('Event category must be string'),
  body('eventValue').optional().isNumeric().withMessage('Event value must be numeric'),
  body('userId').optional().isString().withMessage('User ID must be string'),
  body('sessionId').optional().isString().withMessage('Session ID must be string'),
  validateRequest
];

const validateTag = [
  body('name')
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tag name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-\_]+$/)
    .withMessage('Tag name can only contain letters, numbers, spaces, hyphens and underscores'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['general', 'style', 'color', 'occasion', 'brand', 'category', 'season'])
    .withMessage('Invalid tag type'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  validateRequest
];

const validateTagMerge = [
  body('sourceTagId').isMongoId().withMessage('Invalid source tag ID'),
  body('targetTagId').isMongoId().withMessage('Invalid target tag ID'),
  validateRequest
];

module.exports = {
  validateOutfit,
  validateCelebrity,
  validateBlog,
  validateAdminLogin,
  validateAdminCreate,
  validatePasswordChange,
  validateContentModeration,
  validateTrackClick,
  validateTrackPageView,
  validateTrackEvent,
  validateTag,
  validateTagMerge,
  validateRequest
};