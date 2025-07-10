const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');
const {
  subscribe,
  confirmSubscription,
  unsubscribe,
  updatePreferences,
  getAllSubscribers,
  getSubscriber,
  updateSubscriber,
  addNote,
  deleteSubscriber,
  getStatistics,
  bulkOperations,
  exportSubscribers,
  trackEngagement
} = require('../controllers/newsletterController');

// Rate limiting for newsletter subscription
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 subscriptions per windowMs
  message: 'Too many subscription attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateSubscription = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .isIn(['fashion', 'celebrities', 'outfits', 'trends', 'beauty', 'lifestyle', 'events'])
    .withMessage('Invalid interest'),
  body('preferences.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'bi-weekly', 'monthly'])
    .withMessage('Invalid frequency preference'),
  body('preferences.contentTypes')
    .optional()
    .isArray()
    .withMessage('Content types must be an array'),
  body('preferences.format')
    .optional()
    .isIn(['html', 'text'])
    .withMessage('Invalid format preference'),
  body('source')
    .optional()
    .isIn(['website', 'mobile_app', 'admin', 'api', 'import', 'popup', 'footer'])
    .withMessage('Invalid source'),
  validateRequest
];

const validateUnsubscribe = [
  body('reason')
    .optional()
    .isIn(['too_frequent', 'not_relevant', 'never_signed_up', 'technical_issues', 'other'])
    .withMessage('Invalid unsubscribe reason'),
  validateRequest
];

const validatePreferencesUpdate = [
  body('preferences.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'bi-weekly', 'monthly'])
    .withMessage('Invalid frequency preference'),
  body('preferences.contentTypes')
    .optional()
    .isArray()
    .withMessage('Content types must be an array'),
  body('preferences.format')
    .optional()
    .isIn(['html', 'text'])
    .withMessage('Invalid format preference'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .isIn(['fashion', 'celebrities', 'outfits', 'trends', 'beauty', 'lifestyle', 'events'])
    .withMessage('Invalid interest'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  validateRequest
];

const validateSubscriberUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'unsubscribed', 'bounced', 'complained'])
    .withMessage('Invalid status'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('preferences.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'bi-weekly', 'monthly'])
    .withMessage('Invalid frequency preference'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validateRequest
];

const validateNote = [
  body('note')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Note must be between 1 and 500 characters'),
  validateRequest
];

const validateBulkOperation = [
  body('action')
    .isIn(['update_status', 'add_tags', 'remove_tags', 'update_interests', 'delete'])
    .withMessage('Invalid bulk action'),
  body('subscriberIds')
    .isArray({ min: 1 })
    .withMessage('Subscriber IDs must be a non-empty array'),
  body('subscriberIds.*')
    .isMongoId()
    .withMessage('Invalid subscriber ID'),
  validateRequest
];

const validateEngagementTracking = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('type')
    .isIn(['open', 'click', 'bounce', 'complaint', 'sent'])
    .withMessage('Invalid engagement type'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Invalid timestamp'),
  validateRequest
];

const validateToken = [
  param('token')
    .isLength({ min: 32, max: 64 })
    .withMessage('Invalid token format'),
  validateRequest
];

// Public routes
router.post('/subscribe', subscriptionLimiter, validateSubscription, subscribe);
router.get('/confirm/:token', validateToken, confirmSubscription);
router.post('/unsubscribe/:token', validateToken, validateUnsubscribe, unsubscribe);
router.put('/preferences/:token', validateToken, validatePreferencesUpdate, updatePreferences);

// Webhook for email service providers
router.post('/track', validateEngagementTracking, trackEngagement);

// Protected routes (admin only)
router.use(protect);

// Admin routes
router.get('/', authorize('admin', 'moderator', 'super_admin'), getAllSubscribers);
router.get('/stats', authorize('admin', 'moderator', 'super_admin'), getStatistics);
router.get('/export', authorize('admin', 'super_admin'), exportSubscribers);
router.post('/bulk', authorize('admin', 'moderator', 'super_admin'), validateBulkOperation, bulkOperations);

router.get('/:id', authorize('admin', 'moderator', 'super_admin'), getSubscriber);
router.put('/:id', authorize('admin', 'moderator', 'super_admin'), validateSubscriberUpdate, updateSubscriber);
router.post('/:id/note', authorize('admin', 'moderator', 'super_admin'), validateNote, addNote);
router.delete('/:id', authorize('admin', 'super_admin'), deleteSubscriber);

module.exports = router;