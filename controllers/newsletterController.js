const Newsletter = require('../models/Newsletter');
const ApiResponse = require('../utils/apiResponse');
const crypto = require('crypto');

// Subscribe to newsletter
exports.subscribe = async (req, res, next) => {
  try {
    const {
      email,
      name,
      interests = [],
      preferences = {},
      source = 'website'
    } = req.body;

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active' && existingSubscriber.isConfirmed) {
        return ApiResponse.error(res, 'Email is already subscribed to our newsletter', 409);
      }

      // If unsubscribed or not confirmed, update the subscription
      existingSubscriber.status = 'active';
      existingSubscriber.name = name || existingSubscriber.name;
      existingSubscriber.interests = interests.length > 0 ? interests : existingSubscriber.interests;
      existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
      existingSubscriber.source = source;
      existingSubscriber.subscriptionMetadata = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        utmSource: req.query.utm_source,
        utmMedium: req.query.utm_medium,
        utmCampaign: req.query.utm_campaign,
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        browserInfo: req.get('User-Agent')
      };

      await existingSubscriber.save();

      // Send confirmation email if not confirmed
      if (!existingSubscriber.isConfirmed) {
        // await sendConfirmationEmail(existingSubscriber);
      }

      return ApiResponse.success(
        res,
        {
          id: existingSubscriber._id,
          email: existingSubscriber.email,
          confirmationRequired: !existingSubscriber.isConfirmed
        },
        existingSubscriber.isConfirmed ? 'Subscription updated successfully' : 'Please check your email to confirm your subscription',
        existingSubscriber.isConfirmed ? 200 : 201
      );
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email: email.toLowerCase(),
      name,
      interests,
      preferences: {
        frequency: preferences.frequency || 'weekly',
        contentTypes: preferences.contentTypes || ['celebrity_updates', 'outfit_trends'],
        format: preferences.format || 'html'
      },
      source,
      subscriptionMetadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        utmSource: req.query.utm_source,
        utmMedium: req.query.utm_medium,
        utmCampaign: req.query.utm_campaign,
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        browserInfo: req.get('User-Agent')
      }
    });

    await newsletter.save();

    // Send confirmation email
    // await sendConfirmationEmail(newsletter);

    return ApiResponse.success(
      res,
      {
        id: newsletter._id,
        email: newsletter.email,
        confirmationRequired: true
      },
      'Subscription successful! Please check your email to confirm your subscription.',
      201
    );

  } catch (error) {
    if (error.code === 11000) {
      return ApiResponse.error(res, 'Email is already subscribed', 409);
    }
    return ApiResponse.error(res, error.message, 500);
  }
};

// Confirm subscription
exports.confirmSubscription = async (req, res, next) => {
  try {
    const { token } = req.params;

    const subscriber = await Newsletter.findOne({
      confirmationToken: token,
      isConfirmed: false
    });

    if (!subscriber) {
      return ApiResponse.error(res, 'Invalid or expired confirmation token', 400);
    }

    subscriber.isConfirmed = true;
    subscriber.confirmedAt = new Date();
    subscriber.confirmationToken = undefined;

    await subscriber.save();

    return ApiResponse.success(
      res,
      {
        email: subscriber.email,
        confirmedAt: subscriber.confirmedAt
      },
      'Email confirmed successfully! Welcome to our newsletter.'
    );

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    const subscriber = await Newsletter.findOne({
      unsubscribeToken: token
    });

    if (!subscriber) {
      return ApiResponse.error(res, 'Invalid unsubscribe token', 400);
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.unsubscribeReason = reason;

    await subscriber.save();

    return ApiResponse.success(
      res,
      {
        email: subscriber.email,
        unsubscribedAt: subscriber.unsubscribedAt
      },
      'You have been successfully unsubscribed from our newsletter.'
    );

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update subscription preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { preferences, interests, name } = req.body;

    const subscriber = await Newsletter.findOne({
      unsubscribeToken: token,
      status: 'active'
    });

    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found or inactive', 404);
    }

    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
    }

    if (interests) {
      subscriber.interests = interests;
    }

    if (name) {
      subscriber.name = name;
    }

    await subscriber.save();

    return ApiResponse.success(
      res,
      {
        email: subscriber.email,
        preferences: subscriber.preferences,
        interests: subscriber.interests
      },
      'Preferences updated successfully'
    );

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get all subscribers (Admin only)
exports.getAllSubscribers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      interests,
      confirmed,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (interests) query.interests = { $in: interests.split(',') };
    if (confirmed !== undefined) query.isConfirmed = confirmed === 'true';

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
      select: '-confirmationToken -unsubscribeToken'
    };

    const subscribers = await Newsletter.paginate(query, options);

    return ApiResponse.success(res, subscribers, 'Subscribers retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single subscriber (Admin only)
exports.getSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id)
      .select('-confirmationToken')
      .populate('notes.admin', 'name email');

    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found', 404);
    }

    return ApiResponse.success(res, subscriber, 'Subscriber retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update subscriber (Admin only)
exports.updateSubscriber = async (req, res, next) => {
  try {
    const {
      name,
      status,
      interests,
      preferences,
      tags,
      customFields
    } = req.body;

    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found', 404);
    }

    // Update fields
    if (name !== undefined) subscriber.name = name;
    if (status) subscriber.status = status;
    if (interests) subscriber.interests = interests;
    if (preferences) subscriber.preferences = { ...subscriber.preferences, ...preferences };
    if (tags) subscriber.tags = tags;
    if (customFields) subscriber.customFields = { ...subscriber.customFields, ...customFields };

    await subscriber.save();

    return ApiResponse.success(res, subscriber, 'Subscriber updated successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Add note to subscriber (Admin only)
exports.addNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found', 404);
    }

    subscriber.notes.push({
      admin: req.admin._id,
      note
    });

    await subscriber.save();

    const updatedSubscriber = await Newsletter.findById(subscriber._id)
      .populate('notes.admin', 'name email');

    return ApiResponse.success(res, updatedSubscriber, 'Note added successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete subscriber (Admin only)
exports.deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found', 404);
    }

    await Newsletter.findByIdAndDelete(req.params.id);

    return ApiResponse.success(res, null, 'Subscriber deleted successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get newsletter statistics (Admin only)
exports.getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate, period = '30' } = req.query;

    let start = startDate ? new Date(startDate) : new Date(Date.now() - (parseInt(period) * 24 * 60 * 60 * 1000));
    let end = endDate ? new Date(endDate) : new Date();

    const stats = await Newsletter.getStatistics(start, end);

    // Get segment breakdown
    const segmentBreakdown = await Newsletter.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $addFields: {
          engagementScore: {
            $cond: [
              { $eq: ['$engagement.totalEmailsSent', 0] },
              0,
              {
                $add: [
                  { $multiply: ['$engagement.openRate', 0.3] },
                  { $multiply: ['$engagement.clickRate', 0.7] }
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          segment: {
            $switch: {
              branches: [
                { case: { $gte: ['$engagementScore', 70] }, then: 'highly_engaged' },
                { case: { $gte: ['$engagementScore', 40] }, then: 'engaged' },
                { case: { $gte: ['$engagementScore', 20] }, then: 'moderately_engaged' },
                { case: { $gt: ['$engagementScore', 0] }, then: 'low_engagement' }
              ],
              default: 'new_subscriber'
            }
          }
        }
      },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 }
        }
      }
    ]);

    const response = {
      ...stats,
      segmentBreakdown: segmentBreakdown.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      period: {
        start,
        end,
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      }
    };

    return ApiResponse.success(res, response, 'Newsletter statistics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Bulk operations (Admin only)
exports.bulkOperations = async (req, res, next) => {
  try {
    const { action, subscriberIds, updateData } = req.body;

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return ApiResponse.error(res, 'Subscriber IDs are required', 400);
    }

    let result;

    switch (action) {
      case 'update_status':
        result = await Newsletter.updateMany(
          { _id: { $in: subscriberIds } },
          { $set: { status: updateData.status } }
        );
        break;

      case 'add_tags':
        result = await Newsletter.updateMany(
          { _id: { $in: subscriberIds } },
          { $addToSet: { tags: { $each: updateData.tags } } }
        );
        break;

      case 'remove_tags':
        result = await Newsletter.updateMany(
          { _id: { $in: subscriberIds } },
          { $pullAll: { tags: updateData.tags } }
        );
        break;

      case 'update_interests':
        result = await Newsletter.updateMany(
          { _id: { $in: subscriberIds } },
          { $set: { interests: updateData.interests } }
        );
        break;

      case 'delete':
        result = await Newsletter.deleteMany({ _id: { $in: subscriberIds } });
        break;

      default:
        return ApiResponse.error(res, 'Invalid action', 400);
    }

    return ApiResponse.success(res, {
      action,
      affectedCount: result.modifiedCount || result.deletedCount,
      subscriberIds
    }, `Bulk ${action} completed successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Export subscribers (Admin only)
exports.exportSubscribers = async (req, res, next) => {
  try {
    const { startDate, endDate, status, source, format = 'csv' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const subscribers = await Newsletter.find(query)
      .select('-confirmationToken -unsubscribeToken')
      .sort({ createdAt: -1 })
      .limit(10000); // Limit for performance

    if (format === 'csv') {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');

      // CSV header
      const csvHeader = 'Email,Name,Status,Source,Confirmed,Interests,Frequency,Created Date,Last Opened,Open Rate,Click Rate\n';
      res.write(csvHeader);

      // CSV data
      subscribers.forEach(subscriber => {
        const row = [
          subscriber.email,
          `"${subscriber.name || ''}"`,
          subscriber.status,
          subscriber.source,
          subscriber.isConfirmed,
          `"${subscriber.interests.join(', ')}"`,
          subscriber.preferences.frequency,
          subscriber.createdAt.toISOString(),
          subscriber.engagement.lastOpenedAt ? subscriber.engagement.lastOpenedAt.toISOString() : '',
          subscriber.engagement.openRate + '%',
          subscriber.engagement.clickRate + '%'
        ].join(',') + '\n';
        res.write(row);
      });

      res.end();
    } else {
      // JSON format
      return ApiResponse.success(res, subscribers, 'Subscribers exported successfully');
    }

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Track email engagement (webhook endpoint)
exports.trackEngagement = async (req, res, next) => {
  try {
    const { email, type, timestamp } = req.body; // type: 'open', 'click', 'bounce', 'complaint'

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return ApiResponse.error(res, 'Subscriber not found', 404);
    }

    const engagementDate = timestamp ? new Date(timestamp) : new Date();

    switch (type) {
      case 'open':
        subscriber.engagement.totalEmailsOpened += 1;
        subscriber.engagement.lastOpenedAt = engagementDate;
        break;

      case 'click':
        subscriber.engagement.totalLinksClicked += 1;
        subscriber.engagement.lastClickedAt = engagementDate;
        break;

      case 'bounce':
        subscriber.bounceCount += 1;
        subscriber.lastBounceAt = engagementDate;
        if (subscriber.bounceCount >= 3) {
          subscriber.status = 'bounced';
        }
        break;

      case 'complaint':
        subscriber.complaintCount += 1;
        subscriber.lastComplaintAt = engagementDate;
        subscriber.status = 'complained';
        break;

      case 'sent':
        subscriber.engagement.totalEmailsSent += 1;
        break;
    }

    await subscriber.save();

    return ApiResponse.success(res, null, 'Engagement tracked successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

module.exports = {
  subscribe: exports.subscribe,
  confirmSubscription: exports.confirmSubscription,
  unsubscribe: exports.unsubscribe,
  updatePreferences: exports.updatePreferences,
  getAllSubscribers: exports.getAllSubscribers,
  getSubscriber: exports.getSubscriber,
  updateSubscriber: exports.updateSubscriber,
  addNote: exports.addNote,
  deleteSubscriber: exports.deleteSubscriber,
  getStatistics: exports.getStatistics,
  bulkOperations: exports.bulkOperations,
  exportSubscribers: exports.exportSubscribers,
  trackEngagement: exports.trackEngagement
};