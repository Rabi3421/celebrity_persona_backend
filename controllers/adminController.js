const ApiResponse = require('../utils/apiResponse');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');

// Admin login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    // Check if admin is active
    if (!admin.isActive) {
      return ApiResponse.error(res, 'Account is deactivated', 401);
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await Admin.findByIdAndUpdate(admin._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    });

    // Remove password from response
    admin.password = undefined;

    return ApiResponse.success(res, {
      admin,
      token,
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }, 'Login successful');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create new admin
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return ApiResponse.error(res, 'Admin with this email already exists', 400);
    }

    // Check if this is the first admin (no authentication required for first admin)
    const adminCount = await Admin.countDocuments();
    const isFirstAdmin = adminCount === 0;

    // If not first admin, require authentication
    if (!isFirstAdmin && !req.admin) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || (isFirstAdmin ? 'super_admin' : 'admin'),
      createdBy: req.admin?.id || null
    });

    // Remove password from response
    admin.password = undefined;

    return ApiResponse.success(res, admin, `${isFirstAdmin ? 'First admin' : 'Admin'} created successfully`, 201);

  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Get admin profile
exports.getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return ApiResponse.error(res, 'Admin not found', 404);
    }

    return ApiResponse.success(res, admin, 'Profile retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update admin profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return ApiResponse.error(res, 'Admin not found', 404);
    }

    return ApiResponse.success(res, admin, 'Profile updated successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return ApiResponse.error(res, 'Admin not found', 404);
    }

    // Validate current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return ApiResponse.error(res, 'Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Admin.findByIdAndUpdate(req.admin.id, {
      password: hashedNewPassword,
      passwordChangedAt: new Date()
    });

    return ApiResponse.success(res, null, 'Password changed successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get all admins (super admin only)
exports.getAllAdmins = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const admins = await Admin.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Admin.countDocuments();

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, admins, pagination, 'Admins retrieved successfully');
    } else {
      return ApiResponse.success(res, admins, 'Admins retrieved successfully');
    }

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update admin status
exports.updateAdminStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!admin) {
      return ApiResponse.error(res, 'Admin not found', 404);
    }

    return ApiResponse.success(res, admin, `Admin ${isActive ? 'activated' : 'deactivated'} successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete admin
exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin.id) {
      return ApiResponse.error(res, 'Cannot delete your own account', 400);
    }

    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return ApiResponse.error(res, 'Admin not found', 404);
    }

    return ApiResponse.success(res, null, 'Admin deleted successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCelebrities,
      totalOutfits,
      totalBlogs,
      publishedBlogs,
      trendingOutfits,
      recentActivity
    ] = await Promise.all([
      Celebrity.countDocuments(),
      Outfit.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Outfit.countDocuments({ trending: true }),
      // Get recent activity (last 30 days)
      Blog.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('author', 'name')
    ]);

    const stats = {
      overview: {
        totalCelebrities,
        totalOutfits,
        totalBlogs,
        publishedBlogs,
        trendingOutfits
      },
      recentActivity,
      systemInfo: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      }
    };

    return ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Content moderation
exports.moderateContent = async (req, res, next) => {
  try {
    const { type, id, action } = req.body; // type: 'blog' | 'outfit' | 'celebrity', action: 'approve' | 'reject' | 'feature'

    let result;

    switch (type) {
      case 'blog':
        if (action === 'approve') {
          result = await Blog.findByIdAndUpdate(id, { published: true }, { new: true });
        } else if (action === 'reject') {
          result = await Blog.findByIdAndUpdate(id, { published: false }, { new: true });
        } else if (action === 'feature') {
          result = await Blog.findByIdAndUpdate(id, { featured: true }, { new: true });
        }
        break;

      case 'outfit':
        if (action === 'feature') {
          result = await Outfit.findByIdAndUpdate(id, { trending: true }, { new: true });
        } else if (action === 'reject') {
          result = await Outfit.findByIdAndUpdate(id, { trending: false }, { new: true });
        }
        break;

      case 'celebrity':
        if (action === 'feature') {
          result = await Celebrity.findByIdAndUpdate(id, { trending: true }, { new: true });
        }
        break;

      default:
        return ApiResponse.error(res, 'Invalid content type', 400);
    }

    if (!result) {
      return ApiResponse.error(res, 'Content not found', 404);
    }

    return ApiResponse.success(res, result, `Content ${action}ed successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Bulk operations
exports.bulkOperations = async (req, res, next) => {
  try {
    const { type, ids, action } = req.body;

    let result;

    switch (type) {
      case 'blog':
        if (action === 'publish') {
          result = await Blog.updateMany({ _id: { $in: ids } }, { published: true });
        } else if (action === 'unpublish') {
          result = await Blog.updateMany({ _id: { $in: ids } }, { published: false });
        } else if (action === 'delete') {
          result = await Blog.deleteMany({ _id: { $in: ids } });
        }
        break;

      case 'outfit':
        if (action === 'feature') {
          result = await Outfit.updateMany({ _id: { $in: ids } }, { trending: true });
        } else if (action === 'unfeature') {
          result = await Outfit.updateMany({ _id: { $in: ids } }, { trending: false });
        } else if (action === 'delete') {
          result = await Outfit.deleteMany({ _id: { $in: ids } });
        }
        break;

      default:
        return ApiResponse.error(res, 'Invalid operation type', 400);
    }

    return ApiResponse.success(res, {
      modifiedCount: result.modifiedCount || result.deletedCount,
      operation: action
    }, `Bulk ${action} completed successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// System logs
exports.getSystemLogs = async (req, res, next) => {
  try {
    const fs = require('fs');
    const path = require('path');

    const { type = 'combined', limit = 100 } = req.query;
    const logFile = path.join(__dirname, '..', 'logs', `${type}.log`);

    if (!fs.existsSync(logFile)) {
      return ApiResponse.error(res, 'Log file not found', 404);
    }

    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .slice(-limit)
      .reverse();

    return ApiResponse.success(res, logs, 'System logs retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};