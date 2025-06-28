const Track = require('../models/Track');
const Outfit = require('../models/Outfit');

exports.getTopClickedOutfits = async (req, res) => {
  try {
    const clicks = await Track.aggregate([
      { $match: { type: 'click' } },
      {
        $group: {
          _id: '$refId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'outfits',
          localField: '_id',
          foreignField: '_id',
          as: 'outfit'
        }
      },
      { $unwind: '$outfit' },
      {
        $project: {
          _id: 0,
          outfitId: '$outfit._id',
          title: '$outfit.title',
          image: '$outfit.image',
          count: 1
        }
      }
    ]);
    res.status(200).json(clicks);
  } catch (err) {
    console.error('Error getting top clicked outfits:', err);
    res.status(500).json({ message: 'Server error while getting top clicked outfits' });
  }
};