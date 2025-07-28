const ApiResponse = require('../utils/apiResponse');
const Outfit = require('../models/Outfit');
const Celebrity = require('../models/Celebrity');

// Get all outfits
exports.getOutfits = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const outfits = await Outfit.find()
      .populate('celebrity', 'name image slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Outfit.countDocuments();

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, outfits, pagination, 'Outfits retrieved successfully');
    } else {
      return ApiResponse.success(res, outfits, 'Outfits retrieved successfully');
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get single outfit
exports.getOutfit = async (req, res, next) => {
  try {
    const { id } = req.params;
    let outfit;

    // Check if the parameter is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      outfit = await Outfit.findById(id).populate('celebrity', 'name image slug');
    } else {
      // Search by slug if it exists in your Outfit model
      outfit = await Outfit.findOne({ slug: id }).populate('celebrity', 'name image slug');
    }

    if (!outfit) {
      return ApiResponse.error(res, 'Outfit not found', 404);
    }

    return ApiResponse.success(res, outfit, 'Outfit retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Create outfit
exports.createOutfit = async (req, res, next) => {
  try {
    const outfitData = { ...req.body };

    // Handle images: support both file uploads and image URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.filename);
    } else if (outfitData.images) {
      // Accepts array or single string
      if (typeof outfitData.images === 'string') {
        try {
          images = JSON.parse(outfitData.images);
        } catch {
          images = [outfitData.images];
        }
      } else if (Array.isArray(outfitData.images)) {
        images = outfitData.images;
      }
    }
    outfitData.images = images;

    // Parse tags if sent as a comma-separated string or JSON string
    if (outfitData.tags) {
      if (typeof outfitData.tags === 'string') {
        try {
          outfitData.tags = JSON.parse(outfitData.tags);
        } catch {
          outfitData.tags = outfitData.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
    } else {
      outfitData.tags = [];
    }

    // Parse sections if sent as JSON string
    if (outfitData.sections) {
      if (typeof outfitData.sections === 'string') {
        try {
          outfitData.sections = JSON.parse(outfitData.sections);
        } catch {
          outfitData.sections = [];
        }
      }
    } else {
      outfitData.sections = [];
    }

    // Celebrity is optional, but if provided, verify it exists
    if (outfitData.celebrity) {
      const celebrity = await Celebrity.findById(outfitData.celebrity);
      if (!celebrity) {
        return ApiResponse.error(res, 'Celebrity not found', 400);
      }
    }

    const outfit = await Outfit.create(outfitData);
    const populatedOutfit = await Outfit.findById(outfit._id).populate('celebrity', 'name image slug');

    return ApiResponse.success(res, populatedOutfit, 'Outfit created successfully', 201);
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Update outfit
exports.updateOutfit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid outfit ID format', 400);
    }

    const outfit = await Outfit.findById(id);

    if (!outfit) {
      return ApiResponse.error(res, 'Outfit not found', 404);
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Verify celebrity exists if updating celebrity
    if (updateData.celebrity) {
      const celebrity = await Celebrity.findById(updateData.celebrity);
      if (!celebrity) {
        return ApiResponse.error(res, 'Celebrity not found', 400);
      }
    }

    const updatedOutfit = await Outfit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('celebrity', 'name image slug');

    return ApiResponse.success(res, updatedOutfit, 'Outfit updated successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

// Delete outfit
exports.deleteOutfit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return ApiResponse.error(res, 'Invalid outfit ID format', 400);
    }

    const outfit = await Outfit.findById(id);

    if (!outfit) {
      return ApiResponse.error(res, 'Outfit not found', 404);
    }

    await Outfit.findByIdAndDelete(id);
    return ApiResponse.success(res, null, 'Outfit deleted successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Filter outfits
exports.filterOutfits = async (req, res, next) => {
  try {
    const { celebrity, category, priceRange, tags, trending } = req.body;
    let query = {};

    if (celebrity) query.celebrity = celebrity;
    if (category) query.category = category;
    if (trending !== undefined) query.trending = trending;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    if (priceRange) {
      query.price = {
        $gte: priceRange.min || 0,
        $lte: priceRange.max || 999999
      };
    }

    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    const outfits = await Outfit.find(query)
      .populate('celebrity', 'name image slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Outfit.countDocuments(query);

    if (req.body.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, outfits, pagination, 'Filtered outfits retrieved successfully');
    } else {
      return ApiResponse.success(res, outfits, 'Filtered outfits retrieved successfully');
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get trending outfits
exports.getTrendingOutfits = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const outfits = await Outfit.find({ trending: true })
      .populate('celebrity', 'name image slug')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    return ApiResponse.success(res, outfits, 'Trending outfits retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Search outfits
exports.searchOutfits = async (req, res, next) => {
  try {
    const { name, description, celebrity } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }
    if (celebrity) {
      query.celebrity = celebrity;
    }

    const outfits = await Outfit.find(query)
      .populate('celebrity', 'name image slug')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, outfits, 'Search results retrieved successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

// Get outfit by celebrity
exports.getOutfitsByCelebrity = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;

    // Verify celebrity exists
    const celebrity = await Celebrity.findById(celebrityId);
    if (!celebrity) {
      return ApiResponse.error(res, 'Celebrity not found', 404);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const outfits = await Outfit.find({ celebrity: celebrityId })
      .populate('celebrity', 'name image slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Outfit.countDocuments({ celebrity: celebrityId });

    if (req.query.page) {
      const pagination = { page, limit, total };
      return ApiResponse.paginated(res, outfits, pagination, `${celebrity.name}'s outfits retrieved successfully`);
    } else {
      return ApiResponse.success(res, outfits, `${celebrity.name}'s outfits retrieved successfully`);
    }
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};