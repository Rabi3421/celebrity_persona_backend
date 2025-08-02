const ApiResponse = require('../utils/apiResponse');
const Blog = require('../models/Blog');
const Celebrity = require('../models/Celebrity');
const Tag = require('../models/Tag');

// Get all blogs
exports.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // To get ALL blogs, remove the published filter:
    const blogs = await Blog.find({})
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({});

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, blogs, pagination, 'Blogs retrieved successfully');
    } else {
      return ApiResponse.success(res, blogs, 'Blogs retrieved successfully');
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single blog
exports.getBlog = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let blog;

    // Check if the parameter is a valid MongoDB ObjectId
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(slug)
        .populate('author', 'name email')
        .populate('relatedCelebrities', 'name slug image');
    } else {
      blog = await Blog.findOne({ slug: slug, published: true })
        .populate('author', 'name email')
        .populate('relatedCelebrities', 'name slug image');
    }

    if (!blog) {
      return ApiResponse.error(res, 'Blog not found', 404);
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    return ApiResponse.success(res, blog, 'Blog retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create blog
exports.createBlog = async (req, res, next) => {
  try {
    const blogData = { ...req.body };

    // If coverImage is uploaded as a file, use its filename
    if (req.file) {
      blogData.coverImage = req.file.filename;
    }

    // Directly create the blog with whatever is sent from frontend
    const blog = await Blog.create(blogData);
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image');

    return ApiResponse.success(res, populatedBlog, 'Blog created successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Update blog
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid blog ID format', 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog not found', 404);
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.featuredImage = req.file.filename;
    }

    // Update slug if title changed
    if (updateData.title && updateData.title !== blog.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Verify related celebrities exist
    if (updateData.relatedCelebrities && updateData.relatedCelebrities.length > 0) {
      const celebrities = await Celebrity.find({ _id: { $in: updateData.relatedCelebrities } });
      if (celebrities.length !== updateData.relatedCelebrities.length) {
        return ApiResponse.error(res, 'One or more celebrities not found', 400);
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image');

    return ApiResponse.success(res, updatedBlog, 'Blog updated successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Delete blog
exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid blog ID format', 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog not found', 404);
    }

    await Blog.findByIdAndDelete(id);
    return ApiResponse.success(res, null, 'Blog deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Search blogs
exports.searchBlogs = async (req, res, next) => {
  try {
    const { title, content, category, tag } = req.query;
    let query = { published: true };

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (content) {
      query.content = { $regex: content, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, blogs, pagination, 'Search results retrieved successfully');
    } else {
      return ApiResponse.success(res, blogs, 'Search results retrieved successfully');
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get featured blogs
exports.getFeaturedBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({ published: true, featured: true })
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    return ApiResponse.success(res, blogs, 'Featured blogs retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get blogs by category
exports.getBlogsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ category: category, published: true })
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({ category: category, published: true });

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, blogs, pagination, `${category} blogs retrieved successfully`);
    } else {
      return ApiResponse.success(res, blogs, `${category} blogs retrieved successfully`);
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get popular blogs
exports.getPopularBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const blogs = await Blog.find({ published: true })
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ views: -1, likes: -1 })
      .limit(limit);

    return ApiResponse.success(res, blogs, 'Popular blogs retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get recent blogs
exports.getRecentBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({ published: true })
      .populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image')
      .sort({ createdAt: -1 })
      .limit(limit);

    return ApiResponse.success(res, blogs, 'Recent blogs retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Like/Unlike blog
exports.toggleBlogLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid blog ID format', 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog not found', 404);
    }

    // Simple like increment (in production, you'd track user likes)
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    ).populate('author', 'name email')
      .populate('relatedCelebrities', 'name slug image');

    return ApiResponse.success(res, updatedBlog, 'Blog liked successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};