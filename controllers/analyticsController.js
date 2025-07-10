const ApiResponse = require('../utils/apiResponse');
const Track = require('../models/Track');
const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');
const Admin = require('../models/Admin');

// Get overview analytics
exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date query
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    // Get current period data
    const [
      totalClicks,
      totalPageViews,
      totalEvents,
      uniqueUsers,
      totalCelebrities,
      totalOutfits,
      totalBlogs,
      publishedBlogs
    ] = await Promise.all([
      Track.countDocuments({ type: { $in: ['celebrity', 'outfit', 'blog', 'affiliate_link'] }, ...dateQuery }),
      Track.countDocuments({ type: 'page_view', ...dateQuery }),
      Track.countDocuments({ type: 'custom_event', ...dateQuery }),
      Track.distinct('userId', dateQuery).then(users => users.length),
      Celebrity.countDocuments(),
      Outfit.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ published: true })
    ]);

    // Get previous period for comparison (if date range is specified)
    let previousPeriodData = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      const prevStart = new Date(start.getTime() - (daysDiff * 24 * 60 * 60 * 1000));
      const prevEnd = new Date(start);
      
      const prevDateQuery = {
        timestamp: { $gte: prevStart, $lt: prevEnd }
      };

      const [
        prevTotalClicks,
        prevTotalPageViews,
        prevTotalEvents,
        prevUniqueUsers
      ] = await Promise.all([
        Track.countDocuments({ type: { $in: ['celebrity', 'outfit', 'blog', 'affiliate_link'] }, ...prevDateQuery }),
        Track.countDocuments({ type: 'page_view', ...prevDateQuery }),
        Track.countDocuments({ type: 'custom_event', ...prevDateQuery }),
        Track.distinct('userId', prevDateQuery).then(users => users.length)
      ]);

      previousPeriodData = {
        totalClicks: prevTotalClicks,
        totalPageViews: prevTotalPageViews,
        totalEvents: prevTotalEvents,
        uniqueUsers: prevUniqueUsers
      };
    }

    const overviewData = {
      currentPeriod: {
        totalClicks,
        totalPageViews,
        totalEvents,
        uniqueUsers,
        totalCelebrities,
        totalOutfits,
        totalBlogs,
        publishedBlogs
      },
      previousPeriod: previousPeriodData,
      contentStats: {
        totalCelebrities,
        totalOutfits,
        totalBlogs,
        publishedBlogs,
        draftBlogs: totalBlogs - publishedBlogs
      }
    };

    return ApiResponse.success(res, overviewData, 'Overview analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get traffic analytics
exports.getTrafficAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    // Group by format
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

    const trafficData = await Track.aggregate([
      { $match: dateQuery },
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

    // Group data by period
    const groupedData = {};
    trafficData.forEach(item => {
      if (!groupedData[item.period]) {
        groupedData[item.period] = {
          period: item.period,
          pageViews: 0,
          clicks: 0,
          events: 0,
          uniqueUsers: 0,
          uniqueSessions: 0
        };
      }
      
      if (item.type === 'page_view') {
        groupedData[item.period].pageViews = item.count;
      } else if (['celebrity', 'outfit', 'blog', 'affiliate_link'].includes(item.type)) {
        groupedData[item.period].clicks += item.count;
      } else if (item.type === 'custom_event') {
        groupedData[item.period].events = item.count;
      }
      
      groupedData[item.period].uniqueUsers = Math.max(groupedData[item.period].uniqueUsers, item.uniqueUsers);
      groupedData[item.period].uniqueSessions = Math.max(groupedData[item.period].uniqueSessions, item.uniqueSessions);
    });

    const formattedData = Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period));

    return ApiResponse.success(res, formattedData, 'Traffic analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get content performance analytics
exports.getContentPerformance = async (req, res, next) => {
  try {
    const { type, startDate, endDate, limit = 10 } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    let typeQuery = {};
    if (type) {
      typeQuery.type = type;
    } else {
      typeQuery.type = { $in: ['celebrity', 'outfit', 'blog'] };
    }

    const performanceData = await Track.aggregate([
      { $match: { ...dateQuery, ...typeQuery } },
      {
        $group: {
          _id: {
            type: "$type",
            targetId: "$targetId"
          },
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueSessions: { $addToSet: "$sessionId" },
          lastClick: { $max: "$timestamp" },
          firstClick: { $min: "$timestamp" }
        }
      },
      {
        $project: {
          type: "$_id.type",
          targetId: "$_id.targetId",
          totalClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          uniqueSessions: { $size: "$uniqueSessions" },
          lastClick: 1,
          firstClick: 1,
          _id: 0
        }
      },
      { $sort: { totalClicks: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate content data
    const populatedData = await Promise.all(
      performanceData.map(async (item) => {
        let contentData = null;
        
        try {
          switch (item.type) {
            case 'celebrity':
              contentData = await Celebrity.findById(item.targetId, 'name slug image category');
              break;
            case 'outfit':
              contentData = await Outfit.findById(item.targetId, 'name image price category')
                .populate('celebrity', 'name slug');
              break;
            case 'blog':
              contentData = await Blog.findById(item.targetId, 'title slug excerpt category featuredImage');
              break;
          }
        } catch (err) {
          console.log(`Error populating ${item.type} with ID ${item.targetId}:`, err.message);
        }
        
        return {
          ...item,
          content: contentData
        };
      })
    );

    return ApiResponse.success(res, populatedData, 'Content performance analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get user behavior analytics
exports.getUserBehavior = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    // Get user engagement metrics
    const [
      avgSessionDuration,
      avgPagesPerSession,
      bounceRate,
      topReferrers,
      topUserAgents,
      deviceStats
    ] = await Promise.all([
      // Average session duration (for page views with duration)
      Track.aggregate([
        { $match: { type: 'page_view', duration: { $exists: true }, ...dateQuery } },
        { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
      ]),
      
      // Average pages per session
      Track.aggregate([
        { $match: { type: 'page_view', ...dateQuery } },
        { $group: { _id: "$sessionId", pageCount: { $sum: 1 } } },
        { $group: { _id: null, avgPages: { $avg: "$pageCount" } } }
      ]),
      
      // Bounce rate (sessions with only 1 page view)
      Track.aggregate([
        { $match: { type: 'page_view', ...dateQuery } },
        { $group: { _id: "$sessionId", pageCount: { $sum: 1 } } },
        { $group: { 
          _id: null, 
          totalSessions: { $sum: 1 },
          bounceSessions: { $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] } }
        }}
      ]),
      
      // Top referrers
      Track.aggregate([
        { $match: { referrer: { $exists: true, $ne: "" }, ...dateQuery } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top user agents (simplified)
      Track.aggregate([
        { $match: { userAgent: { $exists: true }, ...dateQuery } },
        {
          $project: {
            browser: {
              $cond: [
                { $regexMatch: { input: "$userAgent", regex: /Chrome/i } }, "Chrome",
                { $cond: [
                  { $regexMatch: { input: "$userAgent", regex: /Firefox/i } }, "Firefox",
                  { $cond: [
                    { $regexMatch: { input: "$userAgent", regex: /Safari/i } }, "Safari",
                    "Other"
                  ]}
                ]}
              ]
            }
          }
        },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Device stats
      Track.aggregate([
        { $match: { userAgent: { $exists: true }, ...dateQuery } },
        {
          $project: {
            device: {
              $cond: [
                { $regexMatch: { input: "$userAgent", regex: /Mobile/i } }, "Mobile",
                { $cond: [
                  { $regexMatch: { input: "$userAgent", regex: /Tablet/i } }, "Tablet",
                  "Desktop"
                ]}
              ]
            }
          }
        },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const behaviorData = {
      engagement: {
        avgSessionDuration: avgSessionDuration[0]?.avgDuration || 0,
        avgPagesPerSession: avgPagesPerSession[0]?.avgPages || 0,
        bounceRate: bounceRate[0] ? (bounceRate[0].bounceSessions / bounceRate[0].totalSessions * 100) : 0
      },
      traffic: {
        topReferrers: topReferrers.map(item => ({ referrer: item._id, visits: item.count })),
        browsers: topUserAgents.map(item => ({ browser: item._id, count: item.count })),
        devices: deviceStats.map(item => ({ device: item._id, count: item.count }))
      }
    };

    return ApiResponse.success(res, behaviorData, 'User behavior analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get conversion analytics
exports.getConversionAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    // Get affiliate link clicks and conversion events
    const [
      affiliateClicks,
      totalPageViews,
      conversionEvents,
      topAffiliateOutfits
    ] = await Promise.all([
      Track.countDocuments({ type: 'affiliate_link', ...dateQuery }),
      Track.countDocuments({ type: 'page_view', ...dateQuery }),
      Track.countDocuments({ eventName: { $in: ['purchase', 'signup', 'newsletter_signup'] }, ...dateQuery }),
      
      // Top performing affiliate links
      Track.aggregate([
        { $match: { type: 'affiliate_link', ...dateQuery } },
        { $group: { 
          _id: "$targetId", 
          clicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" }
        }},
        { $project: {
          targetId: "$_id",
          clicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          _id: 0
        }},
        { $sort: { clicks: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate conversion rates
    const clickToViewRate = totalPageViews > 0 ? (affiliateClicks / totalPageViews * 100) : 0;
    const conversionRate = affiliateClicks > 0 ? (conversionEvents / affiliateClicks * 100) : 0;

    // Populate outfit data for top affiliate links
    const populatedAffiliateOutfits = await Promise.all(
      topAffiliateOutfits.map(async (item) => {
        const outfit = await Outfit.findById(item.targetId, 'name image price affiliateLink')
          .populate('celebrity', 'name slug');
        return { ...item, outfit };
      })
    );

    const conversionData = {
      overview: {
        totalPageViews,
        affiliateClicks,
        conversionEvents,
        clickToViewRate: Math.round(clickToViewRate * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      topPerformers: populatedAffiliateOutfits
    };

    return ApiResponse.success(res, conversionData, 'Conversion analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get real-time analytics
exports.getRealTimeAnalytics = async (req, res, next) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    
    const [
      activeUsers,
      recentActivity,
      hourlyStats,
      livePageViews
    ] = await Promise.all([
      // Active users in last hour
      Track.distinct('userId', { timestamp: { $gte: lastHour } }).then(users => users.length),
      
      // Recent activity (last 10 events)
      Track.find({ timestamp: { $gte: last24Hours } })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('type targetId timestamp userId'),
        
      // Hourly stats for last 24 hours
      Track.aggregate([
        { $match: { timestamp: { $gte: last24Hours } } },
        {
          $group: {
            _id: { $dateToString: { format: "%H", date: "$timestamp" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Live page views (last 5 minutes)
      Track.countDocuments({
        type: 'page_view',
        timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      })
    ]);

    const realTimeData = {
      activeUsers,
      livePageViews,
      recentActivity,
      hourlyActivity: hourlyStats.map(item => ({
        hour: item._id,
        events: item.count
      }))
    };

    return ApiResponse.success(res, realTimeData, 'Real-time analytics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Export analytics data
exports.exportAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    let typeQuery = {};
    if (type !== 'all') {
      typeQuery.type = type;
    }

    const data = await Track.find({ ...dateQuery, ...typeQuery })
      .sort({ timestamp: -1 })
      .limit(10000) // Limit to prevent memory issues
      .select('type targetId timestamp userId sessionId ipAddress userAgent referrer');

    // Convert to CSV format
    const csvHeader = 'Type,Target ID,Timestamp,User ID,Session ID,IP Address,User Agent,Referrer\n';
    const csvData = data.map(item => [
      item.type,
      item.targetId || '',
      item.timestamp.toISOString(),
      item.userId || '',
      item.sessionId || '',
      item.ipAddress || '',
      `"${(item.userAgent || '').replace(/"/g, '""')}"`,
      `"${(item.referrer || '').replace(/"/g, '""')}"`
    ].join(',')).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${Date.now()}.csv`);
    res.send(csv);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};