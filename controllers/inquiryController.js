const Inquiry = require('../models/Inquiry');
const ApiResponse = require('../utils/apiResponse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/inquiries';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'inquiry-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document and image types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 3 // Maximum 3 files
  },
  fileFilter: fileFilter
});

// Submit new inquiry
exports.submitInquiry = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      type,
      source,
      metadata
    } = req.body;

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    const inquiry = new Inquiry({
      name,
      email,
      phone,
      subject,
      message,
      type: type || 'general',
      source: source || 'website',
      ipAddress,
      userAgent,
      referrer,
      attachments,
      metadata: metadata ? JSON.parse(metadata) : {}
    });

    await inquiry.save();

    // Send notification email to admin (implement as needed)
    // await sendAdminNotification(inquiry);

    return ApiResponse.success(
      res,
      {
        id: inquiry._id,
        message: 'Your inquiry has been submitted successfully. We will get back to you soon.'
      },
      'Inquiry submitted successfully',
      201
    );

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get all inquiries (Admin only)
exports.getAllInquiries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      assignedTo,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: [
        {
          path: 'assignedTo',
          select: 'name email role'
        },
        {
          path: 'responses.admin',
          select: 'name email'
        },
        {
          path: 'notes.admin',
          select: 'name email'
        }
      ]
    };

    const inquiries = await Inquiry.paginate(query, options);

    return ApiResponse.success(res, inquiries, 'Inquiries retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single inquiry (Admin only)
exports.getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('responses.admin', 'name email')
      .populate('notes.admin', 'name email')
      .populate('readBy.admin', 'name email');

    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    // Mark as read by current admin
    if (!inquiry.readBy.some(read => read.admin.toString() === req.admin._id.toString())) {
      inquiry.readBy.push({
        admin: req.admin._id,
        readAt: new Date()
      });
      
      if (!inquiry.isRead) {
        inquiry.isRead = true;
      }
      
      await inquiry.save();
    }

    return ApiResponse.success(res, inquiry, 'Inquiry retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update inquiry status (Admin only)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, priority, tags, resolution, followUpDate } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    // Update fields
    if (status) inquiry.status = status;
    if (assignedTo) inquiry.assignedTo = assignedTo;
    if (priority) inquiry.priority = priority;
    if (tags) inquiry.tags = tags;
    if (resolution) inquiry.resolution = resolution;
    if (followUpDate) {
      inquiry.followUpDate = new Date(followUpDate);
      inquiry.followUpRequired = true;
    }

    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('assignedTo', 'name email role');

    return ApiResponse.success(res, updatedInquiry, 'Inquiry updated successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Add response to inquiry (Admin only)
exports.addResponse = async (req, res, next) => {
  try {
    const { message, isPublic = false } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    inquiry.responses.push({
      admin: req.admin._id,
      message,
      isPublic
    });

    // Update status to in_progress if it was pending
    if (inquiry.status === 'pending') {
      inquiry.status = 'in_progress';
    }

    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('responses.admin', 'name email');

    // Send email notification to user if response is public
    // if (isPublic) {
    //   await sendResponseNotification(inquiry, message);
    // }

    return ApiResponse.success(res, updatedInquiry, 'Response added successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Add internal note (Admin only)
exports.addNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    inquiry.notes.push({
      admin: req.admin._id,
      note
    });

    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(inquiry._id)
      .populate('notes.admin', 'name email');

    return ApiResponse.success(res, updatedInquiry, 'Note added successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete inquiry (Admin only)
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    // Delete associated files
    if (inquiry.attachments && inquiry.attachments.length > 0) {
      inquiry.attachments.forEach(attachment => {
        if (fs.existsSync(attachment.path)) {
          fs.unlinkSync(attachment.path);
        }
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    return ApiResponse.success(res, null, 'Inquiry deleted successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get inquiry statistics (Admin only)
exports.getInquiryStats = async (req, res, next) => {
  try {
    const { startDate, endDate, period = '30' } = req.query;

    let start = startDate ? new Date(startDate) : new Date(Date.now() - (parseInt(period) * 24 * 60 * 60 * 1000));
    let end = endDate ? new Date(endDate) : new Date();

    const stats = await Inquiry.getStatistics(start, end);

    // Get recent inquiries
    const recentInquiries = await Inquiry.find({
      createdAt: { $gte: start, $lte: end }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email subject type status priority createdAt')
    .populate('assignedTo', 'name');

    // Get follow-up required count
    const followUpCount = await Inquiry.countDocuments({
      followUpRequired: true,
      followUpDate: { $lte: new Date() },
      status: { $nin: ['resolved', 'closed'] }
    });

    // Get unread count
    const unreadCount = await Inquiry.countDocuments({
      isRead: false
    });

    const response = {
      ...stats,
      followUpRequired: followUpCount,
      unreadCount,
      recentInquiries,
      period: {
        start,
        end,
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      }
    };

    return ApiResponse.success(res, response, 'Inquiry statistics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Bulk operations (Admin only)
exports.bulkOperations = async (req, res, next) => {
  try {
    const { action, inquiryIds, updateData } = req.body;

    if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
      return ApiResponse.error(res, 'Inquiry IDs are required', 400);
    }

    let result;

    switch (action) {
      case 'update_status':
        result = await Inquiry.updateMany(
          { _id: { $in: inquiryIds } },
          { $set: { status: updateData.status } }
        );
        break;

      case 'assign':
        result = await Inquiry.updateMany(
          { _id: { $in: inquiryIds } },
          { $set: { assignedTo: updateData.assignedTo } }
        );
        break;

      case 'mark_read':
        result = await Inquiry.updateMany(
          { _id: { $in: inquiryIds } },
          { $set: { isRead: true } }
        );
        break;

      case 'delete':
        // Get inquiries to delete files
        const inquiriesToDelete = await Inquiry.find({ _id: { $in: inquiryIds } });
        
        // Delete files
        inquiriesToDelete.forEach(inquiry => {
          if (inquiry.attachments && inquiry.attachments.length > 0) {
            inquiry.attachments.forEach(attachment => {
              if (fs.existsSync(attachment.path)) {
                fs.unlinkSync(attachment.path);
              }
            });
          }
        });
        
        result = await Inquiry.deleteMany({ _id: { $in: inquiryIds } });
        break;

      default:
        return ApiResponse.error(res, 'Invalid action', 400);
    }

    return ApiResponse.success(res, {
      action,
      affectedCount: result.modifiedCount || result.deletedCount,
      inquiryIds
    }, `Bulk ${action} completed successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Export inquiries to CSV (Admin only)
exports.exportInquiries = async (req, res, next) => {
  try {
    const { startDate, endDate, status, type, format = 'csv' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const inquiries = await Inquiry.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');

      // CSV header
      const csvHeader = 'ID,Name,Email,Phone,Subject,Type,Status,Priority,Created Date,Assigned To\n';
      res.write(csvHeader);

      // CSV data
      inquiries.forEach(inquiry => {
        const row = [
          inquiry._id,
          `"${inquiry.name}"`,
          inquiry.email,
          inquiry.phone || '',
          `"${inquiry.subject}"`,
          inquiry.type,
          inquiry.status,
          inquiry.priority,
          inquiry.createdAt.toISOString(),
          inquiry.assignedTo ? inquiry.assignedTo.name : ''
        ].join(',') + '\n';
        res.write(row);
      });

      res.end();
    } else {
      // JSON format
      return ApiResponse.success(res, inquiries, 'Inquiries exported successfully');
    }

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get public inquiry status (for users to check their inquiry)
exports.getInquiryStatus = async (req, res, next) => {
  try {
    const { email, inquiryId } = req.query;

    if (!email || !inquiryId) {
      return ApiResponse.error(res, 'Email and inquiry ID are required', 400);
    }

    const inquiry = await Inquiry.findOne({
      _id: inquiryId,
      email: email.toLowerCase()
    }).select('status type subject createdAt responses');

    if (!inquiry) {
      return ApiResponse.error(res, 'Inquiry not found', 404);
    }

    // Only return public responses
    const publicResponses = inquiry.responses.filter(response => response.isPublic);

    const response = {
      id: inquiry._id,
      subject: inquiry.subject,
      type: inquiry.type,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      responses: publicResponses
    };

    return ApiResponse.success(res, response, 'Inquiry status retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

module.exports = {
  submitInquiry: [upload.array('attachments', 3), exports.submitInquiry],
  getAllInquiries: exports.getAllInquiries,
  getInquiry: exports.getInquiry,
  updateInquiryStatus: exports.updateInquiryStatus,
  addResponse: exports.addResponse,
  addNote: exports.addNote,
  deleteInquiry: exports.deleteInquiry,
  getInquiryStats: exports.getInquiryStats,
  bulkOperations: exports.bulkOperations,
  exportInquiries: exports.exportInquiries,
  getInquiryStatus: exports.getInquiryStatus
};