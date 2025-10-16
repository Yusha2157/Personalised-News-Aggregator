/**
 * Validation Utilities for Personalized News Aggregator
 * Additional validation functions beyond Joi schemas
 */

import validator from 'validator';
import { NEWS_CATEGORIES, USER_ROLES } from '../config/constants.js';

class Validators {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    return validator.isEmail(email);
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  isValidUrl(url) {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    });
  }

  /**
   * Validate image URL
   * @param {string} url - Image URL to validate
   * @returns {boolean} True if valid image URL
   */
  isValidImageUrl(url) {
    if (!this.isValidUrl(url)) return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - ObjectId to validate
   * @returns {boolean} True if valid
   */
  isValidObjectId(id) {
    return validator.isMongoId(id);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    const result = {
      isValid: true,
      errors: [],
      strength: 'weak'
    };

    if (!password || typeof password !== 'string') {
      result.isValid = false;
      result.errors.push('Password is required');
      return result;
    }

    if (password.length < 6) {
      result.isValid = false;
      result.errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      result.isValid = false;
      result.errors.push('Password must be less than 128 characters');
    }

    // Calculate strength
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score >= 4) result.strength = 'strong';
    else if (score >= 3) result.strength = 'medium';
    else result.strength = 'weak';

    return result;
  }

  /**
   * Validate news category
   * @param {string} category - Category to validate
   * @returns {boolean} True if valid
   */
  isValidCategory(category) {
    return NEWS_CATEGORIES.includes(category);
  }

  /**
   * Validate user role
   * @param {string} role - Role to validate
   * @returns {boolean} True if valid
   */
  isValidRole(role) {
    return Object.values(USER_ROLES).includes(role);
  }

  /**
   * Validate date string
   * @param {string} date - Date string to validate
   * @returns {boolean} True if valid
   */
  isValidDate(date) {
    const parsed = new Date(date);
    return parsed instanceof Date && !isNaN(parsed);
  }

  /**
   * Validate ISO date string
   * @param {string} date - ISO date string to validate
   * @returns {boolean} True if valid ISO date
   */
  isValidISODate(date) {
    if (!validator.isISO8601(date)) return false;
    
    const parsed = new Date(date);
    return parsed instanceof Date && !isNaN(parsed);
  }

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validation result
   */
  validatePagination(params) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (params.page !== undefined) {
      const page = parseInt(params.page);
      if (isNaN(page) || page < 1) {
        result.isValid = false;
        result.errors.push('Page must be a positive integer');
      }
    }

    if (params.limit !== undefined) {
      const limit = parseInt(params.limit);
      if (isNaN(limit) || limit < 1) {
        result.isValid = false;
        result.errors.push('Limit must be a positive integer');
      } else if (limit > 100) {
        result.warnings.push('Large limit may impact performance');
      }
    }

    return result;
  }

  /**
   * Validate search query
   * @param {string} query - Search query to validate
   * @returns {Object} Validation result
   */
  validateSearchQuery(query) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!query || typeof query !== 'string') {
      result.isValid = false;
      result.errors.push('Search query is required');
      return result;
    }

    const trimmed = query.trim();
    
    if (trimmed.length < 2) {
      result.isValid = false;
      result.errors.push('Search query must be at least 2 characters long');
    }

    if (trimmed.length > 200) {
      result.isValid = false;
      result.errors.push('Search query must be less than 200 characters');
    }

    if (trimmed.length > 100) {
      result.warnings.push('Long search query may return fewer results');
    }

    return result;
  }

  /**
   * Validate tags array
   * @param {Array} tags - Tags array to validate
   * @returns {Object} Validation result
   */
  validateTags(tags) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!Array.isArray(tags)) {
      result.isValid = false;
      result.errors.push('Tags must be an array');
      return result;
    }

    if (tags.length > 20) {
      result.isValid = false;
      result.errors.push('Cannot have more than 20 tags');
    }

    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      
      if (typeof tag !== 'string') {
        result.isValid = false;
        result.errors.push(`Tag at index ${i} must be a string`);
        continue;
      }

      const trimmed = tag.trim();
      
      if (trimmed.length < 2) {
        result.isValid = false;
        result.errors.push(`Tag at index ${i} must be at least 2 characters long`);
      }

      if (trimmed.length > 50) {
        result.isValid = false;
        result.errors.push(`Tag at index ${i} must be less than 50 characters`);
      }

      if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
        result.isValid = false;
        result.errors.push(`Tag at index ${i} contains invalid characters`);
      }
    }

    // Check for duplicates
    const uniqueTags = new Set(tags.map(tag => tag.trim().toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      result.warnings.push('Duplicate tags found');
    }

    return result;
  }

  /**
   * Validate source information
   * @param {Object} source - Source object to validate
   * @returns {Object} Validation result
   */
  validateSource(source) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!source || typeof source !== 'object') {
      result.isValid = false;
      result.errors.push('Source must be an object');
      return result;
    }

    if (!source.name || typeof source.name !== 'string') {
      result.isValid = false;
      result.errors.push('Source name is required');
    } else if (source.name.trim().length < 2) {
      result.isValid = false;
      result.errors.push('Source name must be at least 2 characters long');
    } else if (source.name.length > 100) {
      result.isValid = false;
      result.errors.push('Source name must be less than 100 characters');
    }

    if (source.id && typeof source.id !== 'string') {
      result.isValid = false;
      result.errors.push('Source ID must be a string');
    }

    return result;
  }

  /**
   * Validate article data
   * @param {Object} article - Article data to validate
   * @returns {Object} Validation result
   */
  validateArticle(article) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!article || typeof article !== 'object') {
      result.isValid = false;
      result.errors.push('Article must be an object');
      return result;
    }

    // Validate required fields
    if (!article.title || typeof article.title !== 'string') {
      result.isValid = false;
      result.errors.push('Article title is required');
    } else if (article.title.trim().length < 1) {
      result.isValid = false;
      result.errors.push('Article title cannot be empty');
    } else if (article.title.length > 500) {
      result.isValid = false;
      result.errors.push('Article title must be less than 500 characters');
    }

    if (!article.url || !this.isValidUrl(article.url)) {
      result.isValid = false;
      result.errors.push('Valid article URL is required');
    }

    if (!article.source) {
      result.isValid = false;
      result.errors.push('Article source is required');
    } else {
      const sourceValidation = this.validateSource(article.source);
      if (!sourceValidation.isValid) {
        result.isValid = false;
        result.errors.push(...sourceValidation.errors.map(err => `Source: ${err}`));
      }
    }

    if (!article.publishedAt || !this.isValidDate(article.publishedAt)) {
      result.isValid = false;
      result.errors.push('Valid publication date is required');
    }

    // Validate optional fields
    if (article.description && article.description.length > 2000) {
      result.isValid = false;
      result.errors.push('Article description must be less than 2000 characters');
    }

    if (article.urlToImage && !this.isValidImageUrl(article.urlToImage)) {
      result.isValid = false;
      result.errors.push('Invalid image URL');
    }

    if (article.category && !this.isValidCategory(article.category)) {
      result.isValid = false;
      result.errors.push('Invalid article category');
    }

    if (article.tags) {
      const tagsValidation = this.validateTags(article.tags);
      if (!tagsValidation.isValid) {
        result.isValid = false;
        result.errors.push(...tagsValidation.errors.map(err => `Tags: ${err}`));
      }
    }

    return result;
  }

  /**
   * Sanitize HTML content
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return '';
    
    // Remove script tags and their content
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous attributes
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    
    return sanitized;
  }

  /**
   * Validate and sanitize user input
   * @param {string} input - User input to validate and sanitize
   * @param {Object} options - Validation options
   * @returns {Object} Validation and sanitization result
   */
  validateAndSanitizeInput(input, options = {}) {
    const {
      maxLength = 1000,
      allowHtml = false,
      trimWhitespace = true
    } = options;

    const result = {
      isValid: true,
      errors: [],
      sanitized: ''
    };

    if (!input || typeof input !== 'string') {
      result.isValid = false;
      result.errors.push('Input must be a string');
      return result;
    }

    let processed = input;

    if (trimWhitespace) {
      processed = processed.trim();
    }

    if (processed.length === 0) {
      result.isValid = false;
      result.errors.push('Input cannot be empty');
      return result;
    }

    if (processed.length > maxLength) {
      result.isValid = false;
      result.errors.push(`Input must be less than ${maxLength} characters`);
      return result;
    }

    if (!allowHtml) {
      processed = this.sanitizeHtml(processed);
    }

    result.sanitized = processed;
    return result;
  }
}

export const validators = new Validators();
