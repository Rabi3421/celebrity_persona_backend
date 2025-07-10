const ApiResponse = require('../utils/apiResponse');
const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');
const Track = require('../models/Track');

// Get trending celebrities
exports.getTrendingCelebrities = async (req, res, next) => {
  try {
    const { limit = 10, period = 7 } = req.query;
    const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

    // Get celebrities with most clicks in the specified period
    const trendingCelebrities = await Track.aggregate([
      {
        $match: {
          type: 'celebrity',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          clickCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          trendingScore: {
            $add: [
              '$clickCount',
              { $multiply: ['$uniqueUserCount', 2] }, // Weight unique users more
              { $multiply: ['$uniqueSessionCount', 1.5] }
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'celebrities',
          localField: '_id',
          foreignField: '_id',
          as: 'celebrity'
        }
      },
      {
        $unwind: '$celebrity'
      },
      {
        $project: {
          _id: '$celebrity._id',
          name: '$celebrity.name',
          slug: '$celebrity.slug',
          image: '$celebrity.image',
          profession: '$celebrity.profession',
          category: '$celebrity.category',
          instagramHandle: '$celebrity.instagramHandle',
          clickCount: 1,
          uniqueUserCount: 1,
          uniqueSessionCount: 1,
          trendingScore: 1,
          trending: true
        }
      }
    ]);

    return ApiResponse.success(res, trendingCelebrities, 'Trending celebrities retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending outfits
exports.getTrendingOutfits = async (req, res, next) => {
  try {
    const { limit = 10, period = 7, category } = req.query;
    const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

    // Build base match query
    let matchQuery = {
      type: 'outfit',
      createdAt: { $gte: startDate }
    };

    const trendingOutfits = await Track.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$targetId',
          clickCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          affiliateClicks: {
            $sum: {
              $cond: [{ $ne: ['$url', null] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          trendingScore: {
            $add: [
              '$clickCount',
              { $multiply: ['$uniqueUserCount', 2] },
              { $multiply: ['$uniqueSessionCount', 1.5] },
              { $multiply: ['$affiliateClicks', 3] } // Weight affiliate clicks more
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'outfits',
          localField: '_id',
          foreignField: '_id',
          as: 'outfit'
        }
      },
      {
        $unwind: '$outfit'
      },
      {
        $lookup: {
          from: 'celebrities',
          localField: 'outfit.celebrity',
          foreignField: '_id',
          as: 'celebrity'
        }
      },
      {
        $unwind: '$celebrity'
      },
      {
        $match: category ? { 'outfit.category': category } : {}
      },
      {
        $project: {
          _id: '$outfit._id',
          title: '$outfit.title',
          slug: '$outfit.slug',
          image: '$outfit.image',
          price: '$outfit.price',
          category: '$outfit.category',
          brand: '$outfit.brand',
          affiliateLink: '$outfit.affiliateLink',
          celebrity: {
            _id: '$celebrity._id',
            name: '$celebrity.name',
            slug: '$celebrity.slug'
          },
          clickCount: 1,
          uniqueUserCount: 1,
          uniqueSessionCount: 1,
          affiliateClicks: 1,
          trendingScore: 1,
          trending: true
        }
      }
    ]);

    return ApiResponse.success(res, trendingOutfits, 'Trending outfits retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending blogs
exports.getTrendingBlogs = async (req, res, next) => {
  try {
    const { limit = 10, period = 7, category } = req.query;
    const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

    const trendingBlogs = await Track.aggregate([
      {
        $match: {
          type: 'blog',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          trendingScore: {
            $add: [
              '$views',
              { $multiply: ['$uniqueUserCount', 2] },
              { $multiply: ['$uniqueSessionCount', 1.5] }
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: '_id',
          as: 'blog'
        }
      },
      {
        $unwind: '$blog'
      },
      {
        $match: {
          'blog.published': true,
          ...(category && { 'blog.category': category })
        }
      },
      {
        $project: {
          _id: '$blog._id',
          title: '$blog.title',
          slug: '$blog.slug',
          excerpt: '$blog.excerpt',
          featuredImage: '$blog.featuredImage',
          category: '$blog.category',
          publishedAt: '$blog.publishedAt',
          views: 1,
          uniqueUserCount: 1,
          uniqueSessionCount: 1,
          trendingScore: 1,
          trending: true
        }
      }
    ]);

    return ApiResponse.success(res, trendingBlogs, 'Trending blogs retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get all trending content
exports.getAllTrending = async (req, res, next) => {
  try {
    const { period = 7, limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    // Get trending data for all content types in parallel
    const [trendingCelebrities, trendingOutfits, trendingBlogs] = await Promise.all([
      getTrendingData('celebrity', period, limitNum),
      getTrendingData('outfit', period, limitNum),
      getTrendingData('blog', period, limitNum)
    ]);

    const trendingData = {
      celebrities: trendingCelebrities,
      outfits: trendingOutfits,
      blogs: trendingBlogs,
      summary: {
        totalTrendingItems: trendingCelebrities.length + trendingOutfits.length + trendingBlogs.length,
        period: `${period} days`,
        lastUpdated: new Date()
      }
    };

    return ApiResponse.success(res, trendingData, 'All trending content retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending by category
exports.getTrendingByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { period = 7, limit = 10 } = req.query;

    if (!category) {
      return ApiResponse.error(res, 'Category is required', 400);
    }

    const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

    // Get trending content for specific category
    const trendingContent = await Track.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { targetId: '$targetId', type: '$type' },
          clickCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          trendingScore: {
            $add: [
              '$clickCount',
              { $multiply: ['$uniqueUserCount', 2] },
              { $multiply: ['$uniqueSessionCount', 1.5] }
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Populate content based on type and filter by category
    const populatedContent = [];
    
    for (const item of trendingContent) {
      const { targetId, type } = item._id;
      let content = null;

      switch (type) {
        case 'celebrity':
          content = await Celebrity.findById(targetId).select('name slug image profession category');
          if (content && content.category === category) {
            populatedContent.push({
              ...content.toObject(),
              type: 'celebrity',
              stats: {
                clickCount: item.clickCount,
                uniqueUserCount: item.uniqueUserCount,
                trendingScore: item.trendingScore
              }
            });
          }
          break;
        case 'outfit':
          content = await Outfit.findById(targetId)
            .populate('celebrity', 'name slug')
            .select('title slug image price category brand');
          if (content && content.category === category) {
            populatedContent.push({
              ...content.toObject(),
              type: 'outfit',
              stats: {
                clickCount: item.clickCount,
                uniqueUserCount: item.uniqueUserCount,
                trendingScore: item.trendingScore
              }
            });
          }
          break;
        case 'blog':
          content = await Blog.findById(targetId)
            .select('title slug excerpt featuredImage category publishedAt');
          if (content && content.category === category && content.published) {
            populatedContent.push({
              ...content.toObject(),
              type: 'blog',
              stats: {
                clickCount: item.clickCount,
                uniqueUserCount: item.uniqueUserCount,
                trendingScore: item.trendingScore
              }
            });
          }
          break;
      }
    }

    // Sort by trending score
    populatedContent.sort((a, b) => b.stats.trendingScore - a.stats.trendingScore);

    return ApiResponse.success(res, populatedContent, `Trending content for ${category} retrieved successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Set trending status (Admin only)
exports.setTrendingStatus = async (req, res, next) => {
  try {
    const { type, id, trending } = req.body;

    if (!['celebrity', 'outfit', 'blog'].includes(type)) {
      return ApiResponse.error(res, 'Invalid content type', 400);
    }

    let Model;
    switch (type) {
      case 'celebrity':
        Model = Celebrity;
        break;
      case 'outfit':
        Model = Outfit;
        break;
      case 'blog':
        Model = Blog;
        break;
    }

    const content = await Model.findById(id);
    if (!content) {
      return ApiResponse.error(res, `${type} not found`, 404);
    }

    content.trending = trending;
    await content.save();

    return ApiResponse.success(res, content, `${type} trending status updated successfully`);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending stats
exports.getTrendingStats = async (req, res, next) => {
  try {
    const { period = 7 } = req.query;
    const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

    const stats = await Track.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueSessions: { $addToSet: '$sessionId' },
          uniqueContent: { $addToSet: '$targetId' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueSessionCount: { $size: '$uniqueSessions' },
          uniqueContentCount: { $size: '$uniqueContent' }
        }
      },
      {
        $project: {
          type: '$_id',
          totalClicks: 1,
          uniqueUserCount: 1,
          uniqueSessionCount: 1,
          uniqueContentCount: 1,
          _id: 0
        }
      }
    ]);

    const totalStats = stats.reduce((acc, curr) => ({
      totalClicks: acc.totalClicks + curr.totalClicks,
      totalUniqueUsers: acc.totalUniqueUsers + curr.uniqueUserCount,
      totalUniqueSessions: acc.totalUniqueSessions + curr.uniqueSessionCount,
      totalUniqueContent: acc.totalUniqueContent + curr.uniqueContentCount
    }), { totalClicks: 0, totalUniqueUsers: 0, totalUniqueSessions: 0, totalUniqueContent: 0 });

    const trendingStats = {
      period: `${period} days`,
      byType: stats,
      overall: totalStats,
      generatedAt: new Date()
    };

    return ApiResponse.success(res, trendingStats, 'Trending statistics retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Helper function to get trending data
async function getTrendingData(type, period, limit) {
  const startDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

  const trendingItems = await Track.aggregate([
    {
      $match: {
        type: type,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$targetId',
        clickCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' },
        uniqueSessionCount: { $size: '$uniqueSessions' },
        trendingScore: {
          $add: [
            '$clickCount',
            { $multiply: ['$uniqueUserCount', 2] },
            { $multiply: ['$uniqueSessionCount', 1.5] }
          ]
        }
      }
    },
    {
      $sort: { trendingScore: -1 }
    },
    {
      $limit: limit
    }
  ]);

  // Populate content based on type
  const populatedItems = [];
  
  for (const item of trendingItems) {
    let content = null;
    
    switch (type) {
      case 'celebrity':
        content = await Celebrity.findById(item._id).select('name slug image profession category');
        break;
      case 'outfit':
        content = await Outfit.findById(item._id)
          .populate('celebrity', 'name slug')
          .select('title slug image price category brand');
        break;
      case 'blog':
        content = await Blog.findById(item._id)
          .select('title slug excerpt featuredImage category publishedAt');
        break;
    }
    
    if (content) {
      populatedItems.push({
        ...content.toObject(),
        stats: {
          clickCount: item.clickCount,
          uniqueUserCount: item.uniqueUserCount,
          trendingScore: item.trendingScore
        }
      });
    }
  }
  
  return populatedItems;
}