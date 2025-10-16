/**
 * Article Controller for Personalized News Aggregator
 * Comprehensive article management and operations
 */

import { Article } from '../models/Article.js';
import { newsService } from '../services/newsService.js';
import { cacheService } from '../services/cacheService.js';
import { paginator } from '../utils/paginator.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

/**
 * Fetch news articles from external APIs
 */
export const fetchArticles = catchAsync(async (req, res) => {
  const { categories, sources, query, pageSize, maxPages } = req.query;

  logger.info('Article fetch requested', { categories, sources, query, userId: req.user?._id });

  try {
    const fetchOptions = {
      categories: categories ? categories.split(',') : undefined,
      sources: sources ? sources.split(',') : undefined,
      query: query || '',
      pageSize: parseInt(pageSize) || 50,
      maxPages: parseInt(maxPages) || 3
    };

    const result = await newsService.fetchNews(fetchOptions);

    res.status(HTTP_STATUS.OK).json({
      message: 'News fetch completed successfully',
      result
    });
  } catch (error) {
    logger.error('Article fetch failed:', error);
    throw error;
  }
});

/**
 * Get articles with filtering, pagination, and search
 */
export const getArticles = catchAsync(async (req, res) => {
  const {
    page,
    limit,
    sort,
    order,
    category,
    tags,
    tags_all,
    source,
    q,
    date,
    from,
    to,
    author
  } = req.query;

  // Build cache key
  const cacheKey = `articles:${JSON.stringify(req.query)}`;
  
  // Try to get from cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    logger.debug('Returning cached articles');
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  // Build query
  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    if (tags_all === 'true') {
      query.tags = { $all: tagArray };
    } else {
      query.tags = { $in: tagArray };
    }
  }
  
  if (source) {
    query['source.name'] = new RegExp(source, 'i');
  }
  
  if (author) {
    query.author = new RegExp(author, 'i');
  }
  
  if (date) {
    const dateObj = new Date(date);
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    query.publishedAt = {
      $gte: dateObj,
      $lt: nextDay
    };
  }
  
  if (from || to) {
    query.publishedAt = {};
    if (from) {
      query.publishedAt.$gte = new Date(from);
    }
    if (to) {
      query.publishedAt.$lte = new Date(to);
    }
  }

  // Build sort object
  const sortObj = {};
  if (sort) {
    sortObj[sort] = order === 'asc' ? 1 : -1;
  } else {
    sortObj.publishedAt = -1; // Default sort by published date
  }

  // Handle text search with regex (more reliable than text search)
  let searchQuery = query;
  let searchOptions = {};
  
  if (q) {
    const searchRegex = new RegExp(q, 'i');
    searchQuery = {
      ...query,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { author: searchRegex },
        { 'source.name': searchRegex }
      ]
    };
  }

  // Get pagination parameters
  const { page: pageNum, limit: limitNum, skip } = paginator.normalizeParams({ page, limit });

  // Execute query
  const [articles, total] = await Promise.all([
    Article.find(searchQuery, searchOptions)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Article.countDocuments(searchQuery)
  ]);

  // Create response
  const response = paginator.createResponse(articles, total, { page: pageNum, limit: limitNum });

  // Cache the result
  await cacheService.set(cacheKey, response, 300); // 5 minutes

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get article by ID
 */
export const getArticle = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check cache first
  const cacheKey = `article:${id}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const article = await Article.findOne({ _id: id, isActive: true }).lean();

  if (!article) {
    throw new AppError(
      'Article not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Increment view count
  await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });

  // Cache the result
  await cacheService.set(cacheKey, { article }, 600); // 10 minutes

  res.status(HTTP_STATUS.OK).json({ article });
});

/**
 * Get trending articles
 */
export const getTrendingArticles = catchAsync(async (req, res) => {
  const { period = 7, limit = 10 } = req.query;

  const cacheKey = `trending:articles:${period}:${limit}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  const articles = await Article.findTrending(parseInt(period), parseInt(limit));

  const response = {
    articles,
    period: parseInt(period),
    limit: parseInt(limit),
    generatedAt: new Date().toISOString()
  };

  // Cache for 1 minute
  await cacheService.set(cacheKey, response, 60);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Search articles
 */
export const searchArticles = catchAsync(async (req, res) => {
  const { q, page, limit, category, sort, order } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError(
      'Search query must be at least 2 characters long',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const cacheKey = `search:${q}:${JSON.stringify(req.query)}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  // Build search query
  const searchQuery = {
    $text: { $search: q },
    isActive: true
  };

  if (category) {
    searchQuery.category = category;
  }

  // Build sort
  const sortObj = {
    score: { $meta: 'textScore' }
  };

  if (sort && sort !== 'score') {
    sortObj[sort] = order === 'asc' ? 1 : -1;
  }

  // Get pagination parameters
  const { page: pageNum, limit: limitNum, skip } = paginator.normalizeParams({ page, limit });

  // Execute search
  const [articles, total] = await Promise.all([
    Article.find(searchQuery, { score: { $meta: 'textScore' } })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Article.countDocuments(searchQuery)
  ]);

  const response = paginator.createResponse(articles, total, { page: pageNum, limit: limitNum });
  response.query = q;

  // Cache for 3 minutes
  await cacheService.set(cacheKey, response, 180);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get articles by category
 */
export const getArticlesByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;
  const { page, limit, sort, order } = req.query;

  const cacheKey = `articles:category:${category}:${JSON.stringify(req.query)}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  // Build sort
  const sortObj = {};
  if (sort) {
    sortObj[sort] = order === 'asc' ? 1 : -1;
  } else {
    sortObj.publishedAt = -1;
  }

  // Get pagination parameters
  const { page: pageNum, limit: limitNum, skip } = paginator.normalizeParams({ page, limit });

  // Execute query
  const [articles, total] = await Promise.all([
    Article.find({ category, isActive: true })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Article.countDocuments({ category, isActive: true })
  ]);

  const response = paginator.createResponse(articles, total, { page: pageNum, limit: limitNum });
  response.category = category;

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Get articles by tag
 */
export const getArticlesByTag = catchAsync(async (req, res) => {
  const { tag } = req.params;
  const { page, limit, sort, order } = req.query;

  const cacheKey = `articles:tag:${tag}:${JSON.stringify(req.query)}`;
  
  // Try cache first
  const cached = await cacheService.get(cacheKey);
  if (cached) {
    return res.status(HTTP_STATUS.OK).json(cached);
  }

  // Build sort
  const sortObj = {};
  if (sort) {
    sortObj[sort] = order === 'asc' ? 1 : -1;
  } else {
    sortObj.publishedAt = -1;
  }

  // Get pagination parameters
  const { page: pageNum, limit: limitNum, skip } = paginator.normalizeParams({ page, limit });

  // Execute query
  const [articles, total] = await Promise.all([
    Article.find({ tags: tag, isActive: true })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Article.countDocuments({ tags: tag, isActive: true })
  ]);

  const response = paginator.createResponse(articles, total, { page: pageNum, limit: limitNum });
  response.tag = tag;

  // Cache for 5 minutes
  await cacheService.set(cacheKey, response, 300);

  res.status(HTTP_STATUS.OK).json(response);
});

/**
 * Create a new article (admin only)
 */
export const createArticle = catchAsync(async (req, res) => {
  const articleData = req.body;

  logger.info('Creating new article', { title: articleData.title, userId: req.user._id });

  const article = new Article(articleData);
  await article.save();

  // Invalidate relevant caches
  await cacheService.invalidatePattern([
    'articles:*',
    'trending:*'
  ]);

  logger.info(`Article created: ${article._id}`);

  res.status(HTTP_STATUS.CREATED).json({
    message: 'Article created successfully',
    article
  });
});

/**
 * Update an article (admin only)
 */
export const updateArticle = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const article = await Article.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!article) {
    throw new AppError(
      'Article not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Invalidate caches
  await cacheService.invalidatePattern([
    'articles:*',
    `article:${id}`,
    'trending:*'
  ]);

  logger.info(`Article updated: ${id}`);

  res.status(HTTP_STATUS.OK).json({
    message: 'Article updated successfully',
    article
  });
});

/**
 * Delete an article (admin only)
 */
export const deleteArticle = catchAsync(async (req, res) => {
  const { id } = req.params;

  const article = await Article.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!article) {
    throw new AppError(
      'Article not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Invalidate caches
  await cacheService.invalidatePattern([
    'articles:*',
    `article:${id}`,
    'trending:*'
  ]);

  logger.info(`Article deleted: ${id}`);

  res.status(HTTP_STATUS.OK).json({
    message: 'Article deleted successfully'
  });
});

/**
 * Get article statistics
 */
export const getArticleStats = catchAsync(async (req, res) => {
  const { id } = req.params;

  const article = await Article.findById(id).select('views saves shares').lean();
  
  if (!article) {
    throw new AppError(
      'Article not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  res.status(HTTP_STATUS.OK).json({
    articleId: id,
    stats: {
      views: article.views,
      saves: article.saves,
      shares: article.shares
    }
  });
});

/**
 * Increment article share count
 */
export const shareArticle = catchAsync(async (req, res) => {
  const { id } = req.params;

  const article = await Article.findByIdAndUpdate(
    id,
    { $inc: { shares: 1 } },
    { new: true }
  );

  if (!article) {
    throw new AppError(
      'Article not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  res.status(HTTP_STATUS.OK).json({
    message: 'Article shared successfully',
    shares: article.shares
  });
});
