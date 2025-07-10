const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');
const {
  submitInquiry,
  getAllInquiries,
  getInquiry,
  updateInquiryStatus,
  addResponse,
  addNote,
  deleteInquiry,
  getInquiryStats,
  bulkOperations,
  exportInquiries,
  getInquiryStatus
} = require('../controllers/inquiryController');

// Rate limiting for inquiry submission
const submitInquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 inquiry submissions per windowMs
  message: 'Too many inquiries submitted from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateInquirySubmission = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['general', 'business', 'partnership', 'support', 'feedback', 'press'])
    .withMessage('Invalid inquiry type'),
  body('source')
    .optional()
    .isIn(['website', 'mobile_app', 'social_media', 'email', 'phone', 'other'])
    .withMessage('Invalid source'),
  validateRequest
];

const validateStatusUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid admin ID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('resolution')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Resolution cannot exceed 1000 characters'),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid follow-up date'),
  validateRequest
];

const validateResponse = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Response message must be between 1 and 2000 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  validateRequest
];

const validateNote = [
  body('note')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note must be between 1 and 1000 characters'),
  validateRequest
];

const validateBulkOperation = [
  body('action')
    .isIn(['update_status', 'assign', 'mark_read', 'delete'])
    .withMessage('Invalid bulk action'),
  body('inquiryIds')
    .isArray({ min: 1 })
    .withMessage('Inquiry IDs must be a non-empty array'),
  body('inquiryIds.*')
    .isMongoId()
    .withMessage('Invalid inquiry ID'),
  validateRequest
];

const validateInquiryStatus = [
  query('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  query('inquiryId')
    .isMongoId()
    .withMessage('Invalid inquiry ID'),
  validateRequest
];

// Public routes
router.post('/submit', submitInquiryLimiter, validateInquirySubmission, submitInquiry);
router.get('/status', validateInquiryStatus, getInquiryStatus);

// Protected routes (admin only)
router.use(protect);

// Admin routes
router.get('/', authorize('admin', 'moderator', 'super_admin'), getAllInquiries);
router.get('/stats', authorize('admin', 'moderator', 'super_admin'), getInquiryStats);
router.get('/export', authorize('admin', 'super_admin'), exportInquiries);
router.post('/bulk', authorize('admin', 'moderator', 'super_admin'), validateBulkOperation, bulkOperations);

router.get('/:id', authorize('admin', 'moderator', 'super_admin'), getInquiry);
router.put('/:id', authorize('admin', 'moderator', 'super_admin'), validateStatusUpdate, updateInquiryStatus);
router.post('/:id/response', authorize('admin', 'moderator', 'super_admin'), validateResponse, addResponse);
router.post('/:id/note', authorize('admin', 'moderator', 'super_admin'), validateNote, addNote);
router.delete('/:id', authorize('admin', 'super_admin'), deleteInquiry);

module.exports = router;