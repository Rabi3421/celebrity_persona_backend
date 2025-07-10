const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const cache = require('../middleware/cache');
const {
  getOverviewAnalytics,
  getTrafficAnalytics,
  getContentPerformance,
  getUserBehavior,
  getConversionAnalytics,
  getRealTimeAnalytics,
  exportAnalytics
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(protect);

// Overview analytics
router.get('/overview', cache(300), getOverviewAnalytics); // Cache for 5 minutes

// Traffic analytics
router.get('/traffic', cache(180), getTrafficAnalytics); // Cache for 3 minutes

// Content performance
router.get('/content-performance', cache(300), getContentPerformance);

// User behavior
router.get('/user-behavior', cache(600), getUserBehavior); // Cache for 10 minutes

// Conversion analytics
router.get('/conversions', cache(300), getConversionAnalytics);

// Real-time analytics (no caching)
router.get('/real-time', getRealTimeAnalytics);

// Export analytics (admin+ only)
router.get('/export', authorize('admin', 'super_admin'), exportAnalytics);

module.exports = router;