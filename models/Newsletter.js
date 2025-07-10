const mongoose = require('mongoose');
const crypto = require('crypto');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ],
        index: true
    },
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    status: {
        type: String,
        enum: ['active', 'unsubscribed', 'bounced', 'complained'],
        default: 'active',
        index: true
    },
    source: {
        type: String,
        enum: ['website', 'mobile_app', 'admin', 'api', 'import', 'popup', 'footer'],
        default: 'website',
        index: true
    },
    interests: [{
        type: String,
        enum: ['fashion', 'celebrities', 'outfits', 'trends', 'beauty', 'lifestyle', 'events']
    }],
    preferences: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
            default: 'weekly'
        },
        contentTypes: [{
            type: String,
            enum: ['celebrity_updates', 'outfit_trends', 'fashion_tips', 'exclusive_content', 'promotions']
        }],
        format: {
            type: String,
            enum: ['html', 'text'],
            default: 'html'
        }
    },
    demographics: {
        country: String,
        region: String,
        city: String,
        timezone: String,
        language: {
            type: String,
            default: 'en'
        }
    },
    subscriptionMetadata: {
        ipAddress: String,
        userAgent: String,
        referrer: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        deviceType: String,
        browserInfo: String
    },
    confirmationToken: {
        type: String,
        select: false
    },
    isConfirmed: {
        type: Boolean,
        default: false,
        index: true
    },
    confirmedAt: {
        type: Date
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        sparse: true
    },
    unsubscribedAt: {
        type: Date
    },
    unsubscribeReason: {
        type: String,
        enum: ['too_frequent', 'not_relevant', 'never_signed_up', 'technical_issues', 'other']
    },
    bounceCount: {
        type: Number,
        default: 0
    },
    lastBounceAt: {
        type: Date
    },
    complaintCount: {
        type: Number,
        default: 0
    },
    lastComplaintAt: {
        type: Date
    },
    engagement: {
        totalEmailsSent: {
            type: Number,
            default: 0
        },
        totalEmailsOpened: {
            type: Number,
            default: 0
        },
        totalLinksClicked: {
            type: Number,
            default: 0
        },
        lastOpenedAt: {
            type: Date
        },
        lastClickedAt: {
            type: Date
        },
        openRate: {
            type: Number,
            default: 0
        },
        clickRate: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true
    }],
    customFields: {
        type: mongoose.Schema.Types.Mixed
    },
    notes: [{
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        note: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
newsletterSchema.index({ email: 1, status: 1 });
newsletterSchema.index({ status: 1, createdAt: -1 });
newsletterSchema.index({ source: 1, createdAt: -1 });
newsletterSchema.index({ 'interests': 1 });
newsletterSchema.index({ 'preferences.frequency': 1, status: 1 });
newsletterSchema.index({ isConfirmed: 1, status: 1 });
newsletterSchema.index({ createdAt: -1 });
newsletterSchema.index({
    email: 'text',
    name: 'text',
    tags: 'text'
});

// Virtual for engagement score
newsletterSchema.virtual('engagementScore').get(function () {
    if (this.engagement.totalEmailsSent === 0) return 0;
    const openWeight = 0.3;
    const clickWeight = 0.7;
    return (this.engagement.openRate * openWeight) + (this.engagement.clickRate * clickWeight);
});

// Virtual for subscriber segment
newsletterSchema.virtual('segment').get(function () {
    const score = this.engagementScore;
    if (score >= 70) return 'highly_engaged';
    if (score >= 40) return 'engaged';
    if (score >= 20) return 'moderately_engaged';
    if (score > 0) return 'low_engagement';
    return 'new_subscriber';
});

// Pre-save middleware to generate tokens
newsletterSchema.pre('save', function (next) {
    if (this.isNew) {
        // Generate confirmation token
        if (!this.confirmationToken) {
            this.confirmationToken = crypto.randomBytes(32).toString('hex');
        }

        // Generate unsubscribe token
        if (!this.unsubscribeToken) {
            this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
        }
    }

    // Update engagement rates
    if (this.engagement.totalEmailsSent > 0) {
        this.engagement.openRate = Math.round((this.engagement.totalEmailsOpened / this.engagement.totalEmailsSent) * 100);
        this.engagement.clickRate = Math.round((this.engagement.totalLinksClicked / this.engagement.totalEmailsSent) * 100);
    }

    next();
});

// Static method to get subscription statistics
newsletterSchema.statics.getStatistics = async function (startDate, endDate) {
    const matchQuery = {};
    if (startDate && endDate) {
        matchQuery.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                confirmed: {
                    $sum: { $cond: [{ $eq: ['$isConfirmed', true] }, 1, 0] }
                },
                active: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                unsubscribed: {
                    $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
                },
                bounced: {
                    $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get growth data by day
    const growthData = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                subscriptions: { $sum: 1 },
                confirmed: {
                    $sum: { $cond: [{ $eq: ['$isConfirmed', true] }, 1, 0] }
                }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Get source breakdown
    const sourceBreakdown = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get interest breakdown
    const interestBreakdown = await this.aggregate([
        { $match: matchQuery },
        { $unwind: '$interests' },
        {
            $group: {
                _id: '$interests',
                count: { $sum: 1 }
            }
        }
    ]);
    // Add this to the end of your Newsletter model file, before module.exports
    const mongoosePaginate = require('mongoose-paginate-v2');
    newsletterSchema.plugin(mongoosePaginate);

    return {
        total: stats[0]?.total || 0,
        confirmed: stats[0]?.confirmed || 0,
        active: stats[0]?.active || 0,
        unsubscribed: stats[0]?.unsubscribed || 0,
        bounced: stats[0]?.bounced || 0,
        confirmationRate: stats[0]?.total > 0 ? Math.round((stats[0]?.confirmed / stats[0]?.total) * 100) : 0,
        growthData,
        sourceBreakdown,
        interestBreakdown
    };
};

module.exports = mongoose.model('Newsletter', newsletterSchema);