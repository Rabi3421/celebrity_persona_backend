const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  validateTrackClick, 
  validateTrackPageView, 
  validateTrackEvent 
} = require('../middleware/validation');
const cache = require('../middleware/cache');
const {
  trackClick,
  trackPageView,
  trackEvent,
  getTrackingAnalytics,
  getPopularContent,
  getUserTracking,
  cleanupTrackingData
} = require('../controllers/trackController');

// Public tracking endpoints (no auth required)
router.post('/click', validateTrackClick, trackClick);
router.post('/page-view', validateTrackPageView, trackPageView);
router.post('/event', validateTrackEvent, trackEvent);

// Public analytics endpoints (cached)
router.get('/popular', cache(600), getPopularContent); // Cache for 10 minutes

// Protected analytics endpoints (admin only)
router.use(protect);

router.get('/analytics', getTrackingAnalytics);
router.get('/user/:userId', getUserTracking);
router.get('/session/:sessionId', getUserTracking);

// Admin only endpoints
router.post('/cleanup', authorize('super_admin'), cleanupTrackingData);

module.exports = router;