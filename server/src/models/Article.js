/**
 * Article model for Personalized News Aggregator
 * Comprehensive article schema with indexing and validation
 */

import mongoose from 'mongoose';
import { NEWS_CATEGORIES } from '../config/constants.js';

const sourceSchema = new mongoose.Schema({
  id: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Source name cannot exceed 100 characters']
  }
}, { _id: false });

const metaSchema = new mongoose.Schema({
  score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  wordCount: {
    type: Number,
    min: 0,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    min: 0,
    default: 0
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  }
}, { _id: false });

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    content: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL must be a valid HTTP/HTTPS URL'
      }
    },
    urlToImage: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Image URL must be a valid image URL'
      }
    },
    source: {
      type: sourceSchema,
      required: [true, 'Source is required']
    },
    author: {
      type: String,
      trim: true,
      maxlength: [200, 'Author name cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: [...NEWS_CATEGORIES, null],
      default: null
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 20; // Limit to 20 tags
        },
        message: 'Cannot have more than 20 tags'
      }
    },
    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
      index: true
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    meta: {
      type: metaSchema,
      default: () => ({})
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    saves: {
      type: Number,
      default: 0,
      min: 0
    },
    shares: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for performance
articleSchema.index({ url: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ fetchedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ 'source.name': 1 });
articleSchema.index({ isActive: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ saves: -1 });
articleSchema.index({ shares: -1 });

// Compound indexes
articleSchema.index({ publishedAt: -1, category: 1 });
articleSchema.index({ publishedAt: -1, 'source.name': 1 });
articleSchema.index({ publishedAt: -1, tags: 1 });
articleSchema.index({ isActive: 1, publishedAt: -1 });

// Text index for full-text search
articleSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    description: 3,
    content: 1
  },
  name: 'article_text_index'
});

// Virtual for reading time calculation
articleSchema.virtual('estimatedReadingTime').get(function() {
  if (this.meta && this.meta.wordCount) {
    return Math.ceil(this.meta.wordCount / 200); // Average 200 words per minute
  }
  return 0;
});

/**
 * Pre-save middleware to update meta information
 */
articleSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || this.isModified('content')) {
    // Calculate word count
    const text = `${this.title || ''} ${this.description || ''} ${this.content || ''}`;
    this.meta.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate reading time
    this.meta.readingTime = this.estimatedReadingTime;
    
    // Update last updated timestamp
    this.lastUpdated = new Date();
  }
  
  next();
});

/**
 * Static method to find articles by category
 */
articleSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query)
    .sort({ publishedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

/**
 * Static method to find trending articles
 */
articleSchema.statics.findTrending = function(period = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - period);
  
  return this.find({
    publishedAt: { $gte: date },
    isActive: true
  })
    .sort({ saves: -1, views: -1, publishedAt: -1 })
    .limit(limit);
};

/**
 * Static method to search articles
 */
articleSchema.statics.searchArticles = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

/**
 * Instance method to increment views
 */
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

/**
 * Instance method to increment saves
 */
articleSchema.methods.incrementSaves = function() {
  this.saves += 1;
  return this.save();
};

/**
 * Instance method to increment shares
 */
articleSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

/**
 * Instance method to add tags
 */
articleSchema.methods.addTags = function(newTags) {
  const existingTags = new Set(this.tags.map(tag => tag.toLowerCase()));
  const tagsToAdd = newTags.filter(tag => !existingTags.has(tag.toLowerCase()));
  
  this.tags = [...this.tags, ...tagsToAdd];
  return this.save();
};

/**
 * Instance method to normalize tags
 */
articleSchema.methods.normalizeTags = function() {
  const normalizedTags = this.tags.map(tag => 
    tag.toLowerCase().trim().replace(/\s+/g, ' ')
  );
  
  // Remove duplicates
  this.tags = [...new Set(normalizedTags)];
  return this.save();
};

export const Article = mongoose.model('Article', articleSchema);
