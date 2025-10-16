/**
 * Pagination Utilities for Personalized News Aggregator
 * Consistent pagination handling across the application
 */

import { PAGINATION } from '../config/constants.js';

class Paginator {
  constructor() {
    this.defaultPage = PAGINATION.DEFAULT_PAGE;
    this.defaultLimit = PAGINATION.DEFAULT_LIMIT;
    this.maxLimit = PAGINATION.MAX_LIMIT;
    this.minLimit = PAGINATION.MIN_LIMIT;
  }

  /**
   * Validate and normalize pagination parameters
   * @param {Object} params - Pagination parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Object} Normalized pagination parameters
   */
  normalizeParams(params = {}) {
    const page = Math.max(1, parseInt(params.page) || this.defaultPage);
    const limit = Math.min(
      this.maxLimit,
      Math.max(this.minLimit, parseInt(params.limit) || this.defaultLimit)
    );

    return {
      page,
      limit,
      skip: (page - 1) * limit
    };
  }

  /**
   * Calculate pagination metadata
   * @param {number} total - Total number of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Pagination metadata
   */
  calculateMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      total,
      page,
      limit,
      pages: totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      totalItems: total,
      itemsOnPage: Math.min(limit, total - (page - 1) * limit)
    };
  }

  /**
   * Create paginated response
   * @param {Array} items - Array of items
   * @param {number} total - Total number of items
   * @param {Object} params - Pagination parameters
   * @returns {Object} Paginated response
   */
  createResponse(items, total, params = {}) {
    const { page, limit } = this.normalizeParams(params);
    const meta = this.calculateMeta(total, page, limit);

    return {
      items,
      meta
    };
  }

  /**
   * Create paginated response with custom metadata
   * @param {Array} items - Array of items
   * @param {Object} meta - Custom metadata
   * @returns {Object} Paginated response
   */
  createCustomResponse(items, meta) {
    return {
      items,
      meta: {
        ...meta,
        itemsOnPage: items.length
      }
    };
  }

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validation result
   */
  validateParams(params = {}) {
    const errors = [];
    const warnings = [];

    const page = parseInt(params.page);
    const limit = parseInt(params.limit);

    // Validate page
    if (params.page && (isNaN(page) || page < 1)) {
      errors.push('Page must be a positive integer');
    }

    // Validate limit
    if (params.limit && (isNaN(limit) || limit < this.minLimit || limit > this.maxLimit)) {
      errors.push(`Limit must be between ${this.minLimit} and ${this.maxLimit}`);
    }

    // Warn about large limits
    if (limit > this.defaultLimit * 2) {
      warnings.push(`Large limit (${limit}) may impact performance`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get pagination links for API responses
   * @param {Object} meta - Pagination metadata
   * @param {string} baseUrl - Base URL for links
   * @param {Object} queryParams - Additional query parameters
   * @returns {Object} Pagination links
   */
  createLinks(meta, baseUrl, queryParams = {}) {
    const { page, pages, hasNextPage, hasPrevPage } = meta;
    
    const buildUrl = (pageNum) => {
      const params = new URLSearchParams({
        ...queryParams,
        page: pageNum,
        limit: meta.limit
      });
      
      return `${baseUrl}?${params.toString()}`;
    };

    const links = {
      self: buildUrl(page),
      first: buildUrl(1),
      last: buildUrl(pages)
    };

    if (hasPrevPage) {
      links.prev = buildUrl(page - 1);
    }

    if (hasNextPage) {
      links.next = buildUrl(page + 1);
    }

    return links;
  }

  /**
   * Get cursor-based pagination parameters
   * @param {Object} params - Cursor parameters
   * @param {string} params.cursor - Cursor string
   * @param {number} params.limit - Items per page
   * @param {string} params.direction - 'next' or 'prev'
   * @returns {Object} Cursor pagination parameters
   */
  normalizeCursorParams(params = {}) {
    const limit = Math.min(
      this.maxLimit,
      Math.max(this.minLimit, parseInt(params.limit) || this.defaultLimit)
    );

    return {
      cursor: params.cursor || null,
      limit,
      direction: params.direction || 'next'
    };
  }

  /**
   * Create cursor-based response
   * @param {Array} items - Array of items
   * @param {Object} params - Cursor parameters
   * @returns {Object} Cursor paginated response
   */
  createCursorResponse(items, params = {}) {
    const { limit } = this.normalizeCursorParams(params);
    
    const hasNextPage = items.length === limit;
    const hasPrevPage = params.cursor !== null;

    let nextCursor = null;
    let prevCursor = null;

    if (hasNextPage && items.length > 0) {
      // Use the last item's ID as next cursor
      const lastItem = items[items.length - 1];
      nextCursor = lastItem._id || lastItem.id;
    }

    if (hasPrevPage && items.length > 0) {
      // Use the first item's ID as prev cursor
      const firstItem = items[0];
      prevCursor = firstItem._id || firstItem.id;
    }

    return {
      items,
      meta: {
        limit,
        hasNextPage,
        hasPrevPage,
        nextCursor,
        prevCursor,
        itemsOnPage: items.length
      }
    };
  }

  /**
   * Get offset and limit for database queries
   * @param {Object} params - Pagination parameters
   * @returns {Object} Database query parameters
   */
  getQueryParams(params = {}) {
    const { page, limit, skip } = this.normalizeParams(params);
    
    return {
      skip,
      limit,
      page
    };
  }

  /**
   * Calculate total pages
   * @param {number} total - Total items
   * @param {number} limit - Items per page
   * @returns {number} Total pages
   */
  calculateTotalPages(total, limit) {
    return Math.ceil(total / limit);
  }

  /**
   * Check if page exists
   * @param {number} page - Page number
   * @param {number} total - Total items
   * @param {number} limit - Items per page
   * @returns {boolean} True if page exists
   */
  pageExists(page, total, limit) {
    const totalPages = this.calculateTotalPages(total, limit);
    return page >= 1 && page <= totalPages;
  }

  /**
   * Get page range for pagination UI
   * @param {number} currentPage - Current page
   * @param {number} totalPages - Total pages
   * @param {number} range - Number of pages to show on each side
   * @returns {Array} Array of page numbers
   */
  getPageRange(currentPage, totalPages, range = 2) {
    const pages = [];
    
    // Calculate start and end pages
    let startPage = Math.max(1, currentPage - range);
    let endPage = Math.min(totalPages, currentPage + range);

    // Adjust range if near beginning or end
    if (currentPage <= range) {
      endPage = Math.min(totalPages, 2 * range + 1);
    }
    
    if (currentPage + range >= totalPages) {
      startPage = Math.max(1, totalPages - 2 * range);
    }

    // Generate page array
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Format pagination for API responses
   * @param {Array} items - Items array
   * @param {number} total - Total count
   * @param {Object} params - Pagination parameters
   * @param {string} baseUrl - Base URL for links
   * @returns {Object} Formatted pagination response
   */
  formatResponse(items, total, params = {}, baseUrl = '') {
    const response = this.createResponse(items, total, params);
    
    if (baseUrl) {
      response.links = this.createLinks(response.meta, baseUrl, params);
    }

    return response;
  }
}

export const paginator = new Paginator();
