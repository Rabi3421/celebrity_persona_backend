const ApiResponse = require('../utils/apiResponse');
const Tag = require('../models/Tag');
const Celebrity = require('../models/Celebrity');
const Outfit = require('../models/Outfit');
const Blog = require('../models/Blog');

// Get all tags
exports.getAllTags = async (req, res, next) => {
  try {
    const { type, popular, limit, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const skip = (page - 1) * pageLimit;

    // Build query
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort options
    let sortOption = { name: 1 }; // Default alphabetical
    if (popular === 'true') {
      sortOption = { usageCount: -1, name: 1 };
    }

    const tags = await Tag.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit);

    const total = await Tag.countDocuments(query);
    const pagination = { page, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) };

    return ApiResponse.paginated(res, tags, pagination, 'Tags retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get tag by ID or slug
exports.getTagById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let tag = await Tag.findById(id);
    if (!tag) {
      tag = await Tag.findOne({ slug: id });
    }

    if (!tag) {
      return ApiResponse.error(res, 'Tag not found', 404);
    }

    return ApiResponse.success(res, tag, 'Tag retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get content by tag
exports.getContentByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find tag
    let tag = await Tag.findById(tagId);
    if (!tag) {
      tag = await Tag.findOne({ slug: tagId });
    }

    if (!tag) {
      return ApiResponse.error(res, 'Tag not found', 404);
    }

    let contentData = {};

    // Get content based on type or all types
    if (!type || type === 'celebrity') {
      const celebrities = await Celebrity.find({ tags: tag._id })
        .select('name slug image category profession')
        .skip(type === 'celebrity' ? skip : 0)
        .limit(type === 'celebrity' ? limit : 10);
      
      contentData.celebrities = celebrities;
      
      if (type === 'celebrity') {
        const total = await Celebrity.countDocuments({ tags: tag._id });
        const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
        return ApiResponse.paginated(res, { tag, content: celebrities }, pagination, 'Tagged celebrities retrieved successfully');
      }
    }

    if (!type || type === 'outfit') {
      const outfits = await Outfit.find({ tags: tag._id })
        .populate('celebrity', 'name slug')
        .select('name image price category tags')
        .skip(type === 'outfit' ? skip : 0)
        .limit(type === 'outfit' ? limit : 10);
      
      contentData.outfits = outfits;
      
      if (type === 'outfit') {
        const total = await Outfit.countDocuments({ tags: tag._id });
        const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
        return ApiResponse.paginated(res, { tag, content: outfits }, pagination, 'Tagged outfits retrieved successfully');
      }
    }

    if (!type || type === 'blog') {
      const blogs = await Blog.find({ tags: tag._id, published: true })
        .select('title slug excerpt featuredImage category publishedAt')
        .skip(type === 'blog' ? skip : 0)
        .limit(type === 'blog' ? limit : 10);
      
      contentData.blogs = blogs;
      
      if (type === 'blog') {
        const total = await Blog.countDocuments({ tags: tag._id, published: true });
        const pagination = { page, limit, total, pages: Math.ceil(total / limit) };
        return ApiResponse.paginated(res, { tag, content: blogs }, pagination, 'Tagged blogs retrieved successfully');
      }
    }

    return ApiResponse.success(res, { tag, content: contentData }, 'Tagged content retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get popular tags
exports.getPopularTags = async (req, res, next) => {
  try {
    const { type, limit = 20 } = req.query;
    
    let query = {};
    if (type) {
      query.type = type;
    }

    const popularTags = await Tag.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(parseInt(limit))
      .select('name slug type usageCount color');

    return ApiResponse.success(res, popularTags, 'Popular tags retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending tags
exports.getTrendingTags = async (req, res, next) => {
  try {
    const { days = 7, limit = 15 } = req.query;
    
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    // Get tags that have been used in recently created/updated content
    const trendingTags = await Tag.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'tags',
          as: 'recentBlogs',
          pipeline: [
            {
              $match: {
                $or: [
                  { createdAt: { $gte: startDate } },
                  { updatedAt: { $gte: startDate } }
                ],
                published: true
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'outfits',
          localField: '_id',
          foreignField: 'tags',
          as: 'recentOutfits',
          pipeline: [
            {
              $match: {
                $or: [
                  { createdAt: { $gte: startDate } },
                  { updatedAt: { $gte: startDate } }
                ]
              }
            }
          ]
        }
      },
      {
        $addFields: {
          recentActivity: {
            $add: [
              { $size: '$recentBlogs' },
              { $size: '$recentOutfits' }
            ]
          }
        }
      },
      {
        $match: {
          recentActivity: { $gt: 0 }
        }
      },
      {
        $sort: {
          recentActivity: -1,
          usageCount: -1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          name: 1,
          slug: 1,
          type: 1,
          usageCount: 1,
          color: 1,
          recentActivity: 1
        }
      }
    ]);

    return ApiResponse.success(res, trendingTags, 'Trending tags retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create new tag (Admin only)
exports.createTag = async (req, res, next) => {
  try {
    const { name, description, type, color } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingTag) {
      return ApiResponse.error(res, 'Tag with this name already exists', 400);
    }

    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    const tag = await Tag.create({
      name,
      slug,
      description,
      type: type || 'general',
      color: color || '#007bff',
      usageCount: 0
    });

    return ApiResponse.success(res, tag, 'Tag created successfully', 201);

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update tag (Admin only)
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, color } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return ApiResponse.error(res, 'Tag not found', 404);
    }

    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingTag) {
        return ApiResponse.error(res, 'Tag with this name already exists', 400);
      }

      // Update slug if name changed
      tag.slug = name.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }

    // Update fields
    if (name) tag.name = name;
    if (description !== undefined) tag.description = description;
    if (type) tag.type = type;
    if (color) tag.color = color;

    await tag.save();

    return ApiResponse.success(res, tag, 'Tag updated successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Delete tag (Admin only)
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return ApiResponse.error(res, 'Tag not found', 404);
    }

    // Remove tag from all content
    await Promise.all([
      Celebrity.updateMany({ tags: id }, { $pull: { tags: id } }),
      Outfit.updateMany({ tags: id }, { $pull: { tags: id } }),
      Blog.updateMany({ tags: id }, { $pull: { tags: id } })
    ]);

    await tag.deleteOne();

    return ApiResponse.success(res, null, 'Tag deleted successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Merge tags (Admin only)
exports.mergeTags = async (req, res, next) => {
  try {
    const { sourceTagId, targetTagId } = req.body;

    if (sourceTagId === targetTagId) {
      return ApiResponse.error(res, 'Source and target tags cannot be the same', 400);
    }

    const [sourceTag, targetTag] = await Promise.all([
      Tag.findById(sourceTagId),
      Tag.findById(targetTagId)
    ]);

    if (!sourceTag || !targetTag) {
      return ApiResponse.error(res, 'One or both tags not found', 404);
    }

    // Update all content to use target tag instead of source tag
    await Promise.all([
      Celebrity.updateMany(
        { tags: sourceTagId },
        { 
          $pull: { tags: sourceTagId },
          $addToSet: { tags: targetTagId }
        }
      ),
      Outfit.updateMany(
        { tags: sourceTagId },
        { 
          $pull: { tags: sourceTagId },
          $addToSet: { tags: targetTagId }
        }
      ),
      Blog.updateMany(
        { tags: sourceTagId },
        { 
          $pull: { tags: sourceTagId },
          $addToSet: { tags: targetTagId }
        }
      )
    ]);

    // Update target tag usage count
    targetTag.usageCount += sourceTag.usageCount;
    await targetTag.save();

    // Delete source tag
    await sourceTag.deleteOne();

    return ApiResponse.success(res, targetTag, 'Tags merged successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Update tag usage counts (Admin utility)
exports.updateTagUsageCounts = async (req, res, next) => {
  try {
    const tags = await Tag.find();
    
    const updatePromises = tags.map(async (tag) => {
      const [celebrityCount, outfitCount, blogCount] = await Promise.all([
        Celebrity.countDocuments({ tags: tag._id }),
        Outfit.countDocuments({ tags: tag._id }),
        Blog.countDocuments({ tags: tag._id })
      ]);
      
      tag.usageCount = celebrityCount + outfitCount + blogCount;
      return tag.save();
    });

    await Promise.all(updatePromises);

    return ApiResponse.success(res, null, 'Tag usage counts updated successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Search tags
exports.searchTags = async (req, res, next) => {
  try {
    const { q, type, limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return ApiResponse.error(res, 'Search query must be at least 2 characters', 400);
    }

    let query = {
      name: { $regex: q, $options: 'i' }
    };

    if (type) {
      query.type = type;
    }

    const tags = await Tag.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(parseInt(limit))
      .select('name slug type usageCount color');

    return ApiResponse.success(res, tags, 'Tag search results retrieved successfully');

  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};