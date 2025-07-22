const ApiResponse = require('../utils/apiResponse');
const Celebrity = require('../models/Celebrity');

// Get all celebrities
exports.getCelebrities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const celebrities = await Celebrity.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Celebrity.countDocuments();

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, celebrities, pagination, 'Celebrities retrieved successfully');
    } else {
      return ApiResponse.success(res, celebrities, 'Celebrities retrieved successfully');
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single celebrity
exports.getCelebrity = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let celebrity;

    // Check if the parameter is a valid MongoDB ObjectId
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's a valid ObjectId, search by ID
      celebrity = await Celebrity.findById(slug);
    } else {
      // Otherwise, search by slug
      celebrity = await Celebrity.findOne({ slug: slug });
    }

    if (!celebrity) {
      return ApiResponse.error(res, 'Celebrity not found', 404);
    }

    return ApiResponse.success(res, celebrity, 'Celebrity retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create celebrity
exports.createCelebrity = async (req, res, next) => {
  try {
    const celebrityData = { ...req.body };

    // Handle image upload
    if (req.file) {
      celebrityData.image = req.file.filename;
    }

    // List of array/object fields from your frontend
    const arrayFields = [
      'facts', 'films', 'awards', 'matches', 'trophies', 'albums', 'books',
      'positions', 'achievements', 'events', 'medals', 'sections'
    ];

    arrayFields.forEach(field => {
      if (typeof celebrityData[field] === 'string') {
        try {
          celebrityData[field] = JSON.parse(celebrityData[field]);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    });

    // Auto-generate slug if not provided or empty
    if (!celebrityData.slug && celebrityData.name) {
      celebrityData.slug = celebrityData.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Validate required fields
    if (!celebrityData.name || celebrityData.name.trim() === '') {
      return ApiResponse.error(res, 'Name is required', 400);
    }
    if (!celebrityData.slug || celebrityData.slug.trim() === '') {
      return ApiResponse.error(res, 'Slug is required', 400);
    }

    // Handle birthDate conversion if provided
    if (celebrityData.birthDate && celebrityData.birthDate !== '') {
      try {
        celebrityData.birthDate = new Date(celebrityData.birthDate);
      } catch (e) {
        // Keep original value if parsing fails
      }
    }

    // Store everything as received from frontend
    const celebrity = await Celebrity.create(celebrityData);

    return ApiResponse.success(res, celebrity, 'Celebrity created successfully', 201);
  } catch (error) {
    console.error('Create celebrity error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return ApiResponse.error(res, `Validation failed: ${errors.join(', ')}`, 400);
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return ApiResponse.error(res, `${field} already exists`, 409);
    }
    return ApiResponse.error(res, error.message, 400);
  }
};

// Update celebrity
exports.updateCelebrity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid celebrity ID format', 400);
    }

    const celebrity = await Celebrity.findById(id);

    if (!celebrity) {
      return ApiResponse.error(res, 'Celebrity not found', 404);
    }

    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // List of array/object fields from your frontend
    const arrayFields = [
      'facts', 'films', 'awards', 'matches', 'trophies', 'albums', 'books',
      'positions', 'achievements', 'events', 'medals', 'sections'
    ];

    arrayFields.forEach(field => {
      if (typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    });

    // Handle birthDate conversion if provided
    if (updateData.birthDate && updateData.birthDate !== '') {
      try {
        updateData.birthDate = new Date(updateData.birthDate);
      } catch (e) {
        // Keep original value if parsing fails
      }
    }

    // Auto-generate slug if not provided or empty
    if (!updateData.slug && updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const updatedCelebrity = await Celebrity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return ApiResponse.success(res, updatedCelebrity, 'Celebrity updated successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Delete celebrity
exports.deleteCelebrity = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid celebrity ID format', 400);
    }

    const celebrity = await Celebrity.findById(id);

    if (!celebrity) {
      return ApiResponse.error(res, 'Celebrity not found', 404);
    }

    await Celebrity.findByIdAndDelete(id);
    return ApiResponse.success(res, null, 'Celebrity deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Search celebrities
exports.searchCelebrities = async (req, res, next) => {
  try {
    const { name, category, profession } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (profession) {
      query.profession = profession;
    }

    const celebrities = await Celebrity.find(query).sort({ name: 1 });
    return ApiResponse.success(res, celebrities, 'Search results retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get celebrity outfits
exports.getCelebrityOutfits = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let celebrity;

    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      celebrity = await Celebrity.findById(slug);
    } else {
      celebrity = await Celebrity.findOne({ slug: slug });
    }

    if (!celebrity) {
      return ApiResponse.error(res, 'Celebrity not found', 404);
    }

    const Outfit = require('../models/Outfit');
    const outfits = await Outfit.find({ celebrity: celebrity._id })
      .populate('celebrity', 'name image')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, outfits, `${celebrity.name}'s outfits retrieved successfully`);
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending celebrities
exports.getTrendingCelebrities = async (req, res, next) => {
  try {
    const celebrities = await Celebrity.find({ trending: true })
      .sort({ trendingScore: -1 })
      .limit(10);

    return ApiResponse.success(res, celebrities, 'Trending celebrities retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

//Save draft celebrity
exports.saveDraftCelebrity = async (req, res, next) => {
  try {
    const celebrityData = { ...req.body, isDraft: true };

    // Handle image upload
    if (req.file) {
      celebrityData.image = req.file.filename;
    }

    // Parse arrays/objects
    const arrayFields = [
      'facts', 'films', 'awards', 'matches', 'trophies', 'albums', 'books',
      'positions', 'achievements', 'events', 'medals', 'sections'
    ];
    arrayFields.forEach(field => {
      if (typeof celebrityData[field] === 'string') {
        try { celebrityData[field] = JSON.parse(celebrityData[field]); } catch {}
      }
    });

    // Auto-generate slug if not provided
    if (!celebrityData.slug && celebrityData.name) {
      celebrityData.slug = celebrityData.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Save as draft
    const celebrity = await Celebrity.create(celebrityData);
    return ApiResponse.success(res, celebrity, 'Draft saved successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Get draft celebrities
exports.getDraftCelebrities = async (req, res, next) => {
  try {
    const drafts = await Celebrity.find({ isDraft: true }).sort({ updatedAt: -1 });
    return ApiResponse.success(res, drafts, 'Drafts retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};