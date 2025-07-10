const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiResponse = require('../utils/apiResponse');

// Protect middleware
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, 'Not authorized to access this route', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      return ApiResponse.error(res, 'No admin found with this token', 401);
    }

    if (!req.admin.isActive) {
      return ApiResponse.error(res, 'Admin account is deactivated', 401);
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Not authorized to access this route', 401);
  }
};

// Authorize middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return ApiResponse.error(res, `Role '${req.admin.role}' is not authorized to access this route`, 403);
    }
    next();
  };
};

// Check permission middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    const rolePermissions = {
      admin: ['read', 'write'],
      moderator: ['read', 'write', 'moderate'],
      super_admin: ['read', 'write', 'moderate', 'delete', 'user_management']
    };

    const userPermissions = rolePermissions[req.admin.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return ApiResponse.error(res, 'Insufficient permissions', 403);
    }
    
    next();
  };
};

// Make sure to export all middleware functions
module.exports = {
  protect,
  authorize,
  checkPermission
};