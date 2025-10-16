/**
 * SavedArticle model for tracking user-article relationships
 * Separate collection for analytics and better query performance
 */

import mongoose from 'mongoose';

const savedArticleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article ID is required'],
      index: true
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    category: {
      type: String,
      index: true
    },
    tags: [{
      type: String,
      index: true
    }],
    source: {
      type: String,
      index: true
    },
    // Metadata for analytics
    metadata: {
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown'
      },
      userAgent: String,
      ipAddress: String,
      referrer: String
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
savedArticleSchema.index({ userId: 1, savedAt: -1 });
savedArticleSchema.index({ userId: 1, articleId: 1 }, { unique: true });
savedArticleSchema.index({ savedAt: -1 });
savedArticleSchema.index({ category: 1, savedAt: -1 });
savedArticleSchema.index({ tags: 1, savedAt: -1 });
savedArticleSchema.index({ source: 1, savedAt: -1 });

/**
 * Static method to get saved articles for a user
 */
savedArticleSchema.statics.getUserSavedArticles = function(userId, options = {}) {
  const query = { userId };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  if (options.source) {
    query.source = options.source;
  }
  
  return this.find(query)
    .populate('articleId', 'title description url urlToImage source author category tags publishedAt meta')
    .sort({ savedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

/**
 * Static method to get analytics data
 */
savedArticleSchema.statics.getAnalytics = function(period = 7, options = {}) {
  const date = new Date();
  date.setDate(date.getDate() - period);
  
  const pipeline = [
    {
      $match: {
        savedAt: { $gte: date },
        ...options.filters
      }
    },
    {
      $group: {
        _id: options.groupBy || '$category',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

/**
 * Static method to get trending categories
 */
savedArticleSchema.statics.getTrendingCategories = function(period = 7, limit = 10) {
  return this.getAnalytics(period, { groupBy: '$category' }).limit(limit);
};

/**
 * Static method to get trending tags
 */
savedArticleSchema.statics.getTrendingTags = function(period = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - period);
  
  const pipeline = [
    {
      $match: {
        savedAt: { $gte: date }
      }
    },
    {
      $unwind: '$tags'
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ];
  
  return this.aggregate(pipeline);
};

/**
 * Static method to get trending sources
 */
savedArticleSchema.statics.getTrendingSources = function(period = 7, limit = 10) {
  return this.getAnalytics(period, { groupBy: '$source' }).limit(limit);
};

/**
 * Static method to check if user has saved article
 */
savedArticleSchema.statics.hasUserSavedArticle = function(userId, articleId) {
  return this.findOne({ userId, articleId }).lean();
};

/**
 * Static method to get user's most saved categories
 */
savedArticleSchema.statics.getUserCategoryStats = function(userId) {
  return this.aggregate([
    {
      $match: { userId }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

/**
 * Static method to get user's most saved tags
 */
savedArticleSchema.statics.getUserTagStats = function(userId, limit = 10) {
  return this.aggregate([
    {
      $match: { userId }
    },
    {
      $unwind: '$tags'
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

/**
 * Pre-save middleware to populate metadata from article
 */
savedArticleSchema.pre('save', async function(next) {
  if (this.isNew && !this.category) {
    try {
      const Article = mongoose.model('Article');
      const article = await Article.findById(this.articleId).select('category tags source');
      
      if (article) {
        this.category = article.category;
        this.tags = article.tags;
        this.source = article.source?.name;
      }
    } catch (error) {
      // Continue without metadata if article not found
    }
  }
  
  next();
});

export const SavedArticle = mongoose.model('SavedArticle', savedArticleSchema);
