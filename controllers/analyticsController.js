const Track = require('../models/Track');

exports.getViewsPerDay = async (req, res) => {
  try {
    const views = await Track.aggregate([
      { $match: { type: 'view' } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    res.status(200).json(views);
  } catch (err) {
    console.error('Error getting views per day:', err);
    res.status(500).json({ message: 'Server error while aggregating views' });
  }
};

exports.getClicksPerOutfit = async (req, res) => {
  try {
    const clicks = await Track.aggregate([
      { $match: { type: 'click' } },
      {
        $group: {
          _id: '$refId',
          count: { $sum: 1 }
        }
      },
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
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.status(200).json(clicks);
  } catch (err) {
    console.error('Error getting clicks per outfit:', err);
    res.status(500).json({ message: 'Server error while aggregating clicks' });
  }
};