/**
 * Analytics model for tracking system metrics and events
 * Stores aggregated data for performance and trending analysis
 */

import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'daily_metrics',
        'user_activity',
        'article_performance',
        'trending_data',
        'system_health'
      ],
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily',
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    metadata: {
      source: String,
      version: String,
      environment: String
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ type: 1, period: 1, date: -1 });
analyticsSchema.index({ date: -1, type: 1 });

/**
 * Static method to store daily metrics
 */
analyticsSchema.statics.storeDailyMetrics = function(date, metrics) {
  return this.findOneAndUpdate(
    {
      type: 'daily_metrics',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily'
    },
    {
      type: 'daily_metrics',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily',
      data: metrics,
      metadata: {
        source: 'system',
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Static method to get daily metrics
 */
analyticsSchema.statics.getDailyMetrics = function(startDate, endDate) {
  return this.find({
    type: 'daily_metrics',
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

/**
 * Static method to store trending data
 */
analyticsSchema.statics.storeTrendingData = function(date, trendingData) {
  return this.findOneAndUpdate(
    {
      type: 'trending_data',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily'
    },
    {
      type: 'trending_data',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily',
      data: trendingData,
      metadata: {
        source: 'trending_calculator',
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Static method to get trending data
 */
analyticsSchema.statics.getTrendingData = function(period = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.find({
    type: 'trending_data',
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

/**
 * Static method to store user activity
 */
analyticsSchema.statics.storeUserActivity = function(activityData) {
  return this.create({
    type: 'user_activity',
    date: new Date(),
    period: 'hourly',
    data: activityData,
    metadata: {
      source: 'user_tracking',
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

/**
 * Static method to get user activity metrics
 */
analyticsSchema.statics.getUserActivityMetrics = function(period = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.aggregate([
    {
      $match: {
        type: 'user_activity',
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' },
          hour: { $hour: '$date' }
        },
        totalLogins: { $sum: '$data.logins' },
        totalRegistrations: { $sum: '$data.registrations' },
        totalArticleViews: { $sum: '$data.articleViews' },
        totalArticleSaves: { $sum: '$data.articleSaves' },
        uniqueUsers: { $addToSet: '$data.userId' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
            hour: '$_id.hour'
          }
        },
        totalLogins: 1,
        totalRegistrations: 1,
        totalArticleViews: 1,
        totalArticleSaves: 1,
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { date: -1 }
    }
  ]);
};

/**
 * Static method to store article performance data
 */
analyticsSchema.statics.storeArticlePerformance = function(date, performanceData) {
  return this.findOneAndUpdate(
    {
      type: 'article_performance',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily'
    },
    {
      type: 'article_performance',
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      period: 'daily',
      data: performanceData,
      metadata: {
        source: 'article_tracker',
        version: process.env.npm_package_version || '2.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    },
    { upsert: true, new: true }
  );
};

/**
 * Static method to get article performance metrics
 */
analyticsSchema.statics.getArticlePerformanceMetrics = function(period = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  return this.find({
    type: 'article_performance',
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

/**
 * Static method to store system health data
 */
analyticsSchema.statics.storeSystemHealth = function(healthData) {
  return this.create({
    type: 'system_health',
    date: new Date(),
    period: 'hourly',
    data: healthData,
    metadata: {
      source: 'health_monitor',
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

/**
 * Static method to get system health metrics
 */
analyticsSchema.statics.getSystemHealthMetrics = function(period = 24) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - period);
  
  return this.find({
    type: 'system_health',
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

/**
 * Static method to cleanup old analytics data
 */
analyticsSchema.statics.cleanupOldData = function(retentionDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  return this.deleteMany({
    date: { $lt: cutoffDate },
    type: { $in: ['user_activity', 'system_health'] }
  });
};

export const Analytics = mongoose.model('Analytics', analyticsSchema);
