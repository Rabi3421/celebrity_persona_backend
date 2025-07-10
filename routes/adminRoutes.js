const router = require('express').Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { 
  validateAdminLogin, 
  validateAdminCreate, 
  validatePasswordChange,
  validateContentModeration 
} = require('../middleware/validation');
const {
  login,
  createAdmin,
  getProfile,
  updateProfile,
  changePassword,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin,
  getDashboardStats,
  moderateContent,
  bulkOperations,
  getSystemLogs
} = require('../controllers/adminController');

// Public routes
router.post('/login', validateAdminLogin, login);

// Protected routes (require authentication)
router.use(protect);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Content moderation
router.post('/moderate', validateContentModeration, checkPermission('moderate'), moderateContent);
router.post('/bulk-operations', checkPermission('moderate'), bulkOperations);

// System management
router.get('/logs', authorize('super_admin'), getSystemLogs);

// User management (super admin only)
router.get('/users', authorize('super_admin'), getAllAdmins);
router.post('/users', authorize('super_admin'), validateAdminCreate, createAdmin);
router.put('/users/:id/status', authorize('super_admin'), updateAdminStatus);
router.delete('/users/:id', authorize('super_admin'), deleteAdmin);

module.exports = router;