const ApiResponse = require('../utils/apiResponse');
const Track = require('../models/Track');
const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');

// Track click event
exports.trackClick = async (req, res, next) => {
  try {
    const { 
      type, 
      targetId, 
      url, 
      userAgent, 
      referrer, 
      userId, 
      sessionId,
      additionalData 
    } = req.body;

    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Verify target exists based on type
    let targetExists = false;
    let targetData = null;

    switch (type) {
      case 'celebrity':
        targetData = await Celebrity.findById(targetId);
        targetExists = !!targetData;
        break;
      case 'outfit':
        targetData = await Outfit.findById(targetId);
        targetExists = !!targetData;
        break;
      case 'blog':
        targetData = await Blog.findById(targetId);
        targetExists = !!targetData;
        break;
      case 'affiliate_link':
      case 'external_link':
        targetExists = true; // External links don't need verification
        break;
      default:
        return ApiResponse.error(res, 'Invalid track type', 400);
    }

    if (!targetExists) {
      return ApiResponse.error(res, 'Target not found', 404);
    }

    // Create tracking record
    const trackData = {
      type,
      targetId,
      url,
      ipAddress,
      userAgent: userAgent || req.get('User-Agent'),
      referrer: referrer || req.get('Referrer'),
      userId,
      sessionId,
      timestamp: new Date(),
      additionalData: additionalData || {}
    };

    const track = await Track.create(trackData);

    // Update target's click count if applicable
    if (type === 'celebrity') {
      await Celebrity.findByIdAndUpdate(targetId, { $inc: { clickCount: 1 } });
    } else if (type === 'outfit') {
      await Outfit.findByIdAndUpdate(targetId, { $inc: { clickCount: 1 } });
    } else if (type === 'blog') {
      await Blog.findByIdAndUpdate(targetId, { $inc: { views: 1 } });
    }

    return ApiResponse.success(res, { trackId: track._id }, 'Click tracked successfully', 201);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Track page view
exports.trackPageView = async (req, res, next) => {
  try {
    const { 
      page, 
      title, 
      url, 
      userId, 
      sessionId, 
      duration,
      additionalData 
    } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const trackData = {
      type: 'page_view',
      page,
      title,
      url,
      ipAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      userId,
      sessionId,
      duration,
      timestamp: new Date(),
      additionalData: additionalData || {}
    };

    const track = await Track.create(trackData);

    return ApiResponse.success(res, { trackId: track._id }, 'Page view tracked successfully', 201);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Track custom event
exports.trackEvent = async (req, res, next) => {
  try {
    const { 
      eventName, 
      eventCategory, 
      eventValue, 
      targetId, 
      userId, 
      sessionId,
      additionalData 
    } = req.body;

    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const trackData = {
      type: 'custom_event',
      eventName,
      eventCategory,
      eventValue,
      targetId,
      ipAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      userId,
      sessionId,
      timestamp: new Date(),
      additionalData: additionalData || {}
    };

    const track = await Track.create(trackData);

    return ApiResponse.success(res, { trackId: track._id }, 'Event tracked successfully', 201);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get tracking analytics
exports.getTrackingAnalytics = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      targetId, 
      groupBy = 'day' 
    } = req.query;

    // Build query
    let query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    if (targetId) query.targetId = targetId;

    // Aggregation pipeline
    let groupByFormat;
    switch (groupBy) {
      case 'hour':
        groupByFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } };
        break;
      case 'day':
        groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        break;
      case 'week':
        groupByFormat = { $dateToString: { format: "%Y-%U", date: "$timestamp" } };
        break;
      case 'month':
        groupByFormat = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
        break;
      default:
        groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
    }

    const analytics = await Track.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            period: groupByFormat,
            type: "$type"
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueSessions: { $addToSet: "$sessionId" }
        }
      },
      {
        $project: {
          period: "$_id.period",
          type: "$_id.type",
          count: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          uniqueSessions: { $size: "$uniqueSessions" },
          _id: 0
        }
      },
      { $sort: { period: 1 } }
    ]);

    // Get summary statistics
    const summary = await Track.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueSessions: { $addToSet: "$sessionId" },
          eventTypes: { $addToSet: "$type" }
        }
      },
      {
        $project: {
          totalEvents: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          uniqueSessions: { $size: "$uniqueSessions" },
          eventTypes: 1,
          _id: 0
        }
      }
    ]);

    return ApiResponse.success(res, {
      analytics,
      summary: summary[0] || { totalEvents: 0, uniqueUsers: 0, uniqueSessions: 0, eventTypes: [] }
    }, 'Tracking analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get popular content
exports.getPopularContent = async (req, res, next) => {
  try {
    const { 
      type, 
      startDate, 
      endDate, 
      limit = 10 
    } = req.query;

    // Build query
    let query = {};
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (type) {
      query.type = type;
    } else {
      query.type = { $in: ['celebrity', 'outfit', 'blog'] };
    }

    const popularContent = await Track.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            type: "$type",
            targetId: "$targetId"
          },
          clickCount: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          lastClick: { $max: "$timestamp" }
        }
      },
      {
        $project: {
          type: "$_id.type",
          targetId: "$_id.targetId",
          clickCount: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          lastClick: 1,
          _id: 0
        }
      },
      { $sort: { clickCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate target data
    const populatedContent = await Promise.all(
      popularContent.map(async (item) => {
        let targetData = null;
        
        switch (item.type) {
          case 'celebrity':
            targetData = await Celebrity.findById(item.targetId, 'name slug image');
            break;
          case 'outfit':
            targetData = await Outfit.findById(item.targetId, 'name image celebrity')
              .populate('celebrity', 'name slug');
            break;
          case 'blog':
            targetData = await Blog.findById(item.targetId, 'title slug excerpt featuredImage');
            break;
        }
        
        return { ...item, targetData };
      })
    );

    return ApiResponse.success(res, populatedContent, 'Popular content retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get user tracking data
exports.getUserTracking = async (req, res, next) => {
  try {
    const { userId, sessionId } = req.params;
    const { startDate, endDate } = req.query;

    let query = {};
    
    if (userId) query.userId = userId;
    if (sessionId) query.sessionId = sessionId;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const trackingData = await Track.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Track.countDocuments(query);

    const pagination = { page, limit, total };
    return ApiResponse.paginated(res, trackingData, pagination, 'User tracking data retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete old tracking data
exports.cleanupTrackingData = async (req, res, next) => {
  try {
    const { daysOld = 90 } = req.body;
    
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    const result = await Track.deleteMany({ 
      timestamp: { $lt: cutoffDate } 
    });

    return ApiResponse.success(res, { 
      deletedCount: result.deletedCount,
      cutoffDate 
    }, 'Old tracking data cleaned up successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};