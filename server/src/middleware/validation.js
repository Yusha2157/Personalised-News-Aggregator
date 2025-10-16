/**
 * Input validation middleware using Joi
 * Centralized validation for all API endpoints
 */

import Joi from 'joi';
import { ERROR_CODES, HTTP_STATUS, NEWS_CATEGORIES, USER_ROLES } from '../config/constants.js';
import { AppError } from './errorHandler.js';

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new AppError(
        'Validation failed',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        ERROR_CODES.VALIDATION_ERROR,
        details
      ));
    }

    // Replace the property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

// Common validation schemas
const commonSchemas = {
  mongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  optionalMongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(100).trim().required(),
  optionalName: Joi.string().min(2).max(100).trim(),
  url: Joi.string().uri().required(),
  optionalUrl: Joi.string().uri(),
  imageUrl: Joi.string().uri().pattern(/\.(jpg|jpeg|png|gif|webp)$/i),
  date: Joi.date().iso(),
  optionalDate: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('publishedAt', 'fetchedAt', 'views', 'saves', 'shares', 'score'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  category: Joi.string().valid(...NEWS_CATEGORIES).allow('').optional(),
  role: Joi.string().valid(...Object.values(USER_ROLES))
};

// Authentication schemas
export const authSchemas = {
  register: Joi.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: commonSchemas.password,
    interests: Joi.array().items(Joi.string().trim()).max(10).optional(),
    preferences: Joi.object({
      categories: Joi.array().items(commonSchemas.category).optional(),
      sources: Joi.array().items(Joi.string().trim()).optional(),
      language: Joi.string().length(2).default('en').optional(),
      notifications: Joi.object({
        email: Joi.boolean().default(true),
        push: Joi.boolean().default(false)
      }).optional()
    }).optional()
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password
  }),

  changePassword: Joi.object({
    currentPassword: commonSchemas.password,
    newPassword: commonSchemas.password
  }),

  updateProfile: Joi.object({
    name: commonSchemas.optionalName,
    avatarUrl: commonSchemas.imageUrl.optional(),
    preferences: Joi.object({
      categories: Joi.array().items(commonSchemas.category).optional(),
      sources: Joi.array().items(Joi.string().trim()).optional(),
      language: Joi.string().length(2).optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional()
      }).optional()
    }).optional()
  })
};

// Article schemas
export const articleSchemas = {
  fetch: Joi.object({
    categories: Joi.array().items(commonSchemas.category).optional(),
    sources: Joi.array().items(Joi.string().trim()).optional(),
    query: Joi.string().trim().max(200).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(100),
    maxPages: Joi.number().integer().min(1).max(20).default(10)
  }),

  query: Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    sort: commonSchemas.sort,
    order: commonSchemas.order,
    category: commonSchemas.category.optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim().allow(''),
      Joi.array().items(Joi.string().trim())
    ).optional(),
    tags_all: Joi.boolean().default(false),
    source: Joi.string().trim().optional(),
    q: Joi.string().trim().max(200).allow('').optional(),
    date: Joi.date().iso().optional(),
    from: Joi.string().trim().allow('').optional(),
    to: Joi.string().trim().allow('').optional(),
    author: Joi.string().trim().optional()
  }),

  save: Joi.object({
    articleId: commonSchemas.mongoId
  }),

  create: Joi.object({
    title: Joi.string().min(1).max(500).trim().required(),
    description: Joi.string().max(2000).trim().optional(),
    content: Joi.string().trim().optional(),
    url: commonSchemas.url,
    urlToImage: commonSchemas.imageUrl.optional(),
    source: Joi.object({
      id: Joi.string().trim().optional(),
      name: Joi.string().min(1).max(100).trim().required()
    }).required(),
    author: Joi.string().max(200).trim().optional(),
    category: commonSchemas.category.optional(),
    tags: Joi.array().items(Joi.string().trim()).max(20).optional(),
    publishedAt: commonSchemas.date.required()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(500).trim().optional(),
    description: Joi.string().max(2000).trim().optional(),
    content: Joi.string().trim().optional(),
    urlToImage: commonSchemas.imageUrl.optional(),
    source: Joi.object({
      id: Joi.string().trim().optional(),
      name: Joi.string().min(1).max(100).trim().optional()
    }).optional(),
    author: Joi.string().max(200).trim().optional(),
    category: commonSchemas.category.optional(),
    tags: Joi.array().items(Joi.string().trim()).max(20).optional(),
    publishedAt: commonSchemas.optionalDate.optional()
  })
};

// User schemas
export const userSchemas = {
  update: Joi.object({
    name: commonSchemas.optionalName,
    avatarUrl: commonSchemas.imageUrl.optional(),
    interests: Joi.array().items(Joi.string().trim()).max(10).optional(),
    preferences: Joi.object({
      categories: Joi.array().items(commonSchemas.category).optional(),
      sources: Joi.array().items(Joi.string().trim()).optional(),
      language: Joi.string().length(2).optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional()
      }).optional()
    }).optional()
  }),

  savedArticles: Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    category: commonSchemas.category.optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional(),
    source: Joi.string().trim().optional()
  })
};

// Stats schemas
export const statsSchemas = {
  trending: Joi.object({
    period: Joi.number().integer().min(1).max(365).default(7),
    limit: commonSchemas.limit.max(50)
  }),

  analytics: Joi.object({
    startDate: commonSchemas.date.required(),
    endDate: commonSchemas.date.required(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day')
  })
};

// Admin schemas
export const adminSchemas = {
  userUpdate: Joi.object({
    name: commonSchemas.optionalName,
    email: Joi.string().email().lowercase().trim().optional(),
    role: commonSchemas.role.optional(),
    isActive: Joi.boolean().optional()
  }),

  systemConfig: Joi.object({
    fetchInterval: Joi.number().integer().min(60).max(86400).optional(),
    maxArticlesPerFetch: Joi.number().integer().min(10).max(1000).optional(),
    cacheTimeout: Joi.number().integer().min(60).max(3600).optional()
  })
};

// Validation middleware exports
export const validateAuth = {
  register: validate(authSchemas.register),
  login: validate(authSchemas.login),
  refreshToken: validate(authSchemas.refreshToken),
  forgotPassword: validate(authSchemas.forgotPassword),
  resetPassword: validate(authSchemas.resetPassword),
  changePassword: validate(authSchemas.changePassword),
  updateProfile: validate(authSchemas.updateProfile)
};

export const validateArticle = {
  fetch: validate(articleSchemas.fetch),
  query: validate(articleSchemas.query, 'query'),
  save: validate(articleSchemas.save),
  create: validate(articleSchemas.create),
  update: validate(articleSchemas.update)
};

export const validateUser = {
  update: validate(userSchemas.update),
  savedArticles: validate(userSchemas.savedArticles, 'query'),
  save: validate(articleSchemas.save)
};

export const validateStats = {
  trending: validate(statsSchemas.trending, 'query'),
  analytics: validate(statsSchemas.analytics, 'query')
};

export const validateAdmin = {
  userUpdate: validate(adminSchemas.userUpdate),
  systemConfig: validate(adminSchemas.systemConfig)
};

// Parameter validation
export const validateParams = {
  mongoId: validate(Joi.object({
    id: commonSchemas.mongoId
  }), 'params'),

  userId: validate(Joi.object({
    id: commonSchemas.mongoId
  }), 'params'),

  articleId: validate(Joi.object({
    id: commonSchemas.mongoId
  }), 'params')
};

// Query validation
export const validateQuery = {
  pagination: validate(Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }), 'query'),

  search: validate(Joi.object({
    q: Joi.string().trim().max(200).optional(),
    category: commonSchemas.category.optional(),
    tags: Joi.alternatives().try(
      Joi.string().trim(),
      Joi.array().items(Joi.string().trim())
    ).optional()
  }), 'query')
};
