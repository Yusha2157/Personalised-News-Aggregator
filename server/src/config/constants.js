/**
 * Application constants and configuration values
 * Centralized constants for the news aggregator
 */

export const NEWS_CATEGORIES = [
  'technology',
  'business',
  'sports',
  'health',
  'science',
  'entertainment',
  'politics',
  'general'
];

export const NEWS_SOURCES = [
  'techcrunch.com',
  'reuters.com',
  'bbc.com',
  'cnn.com',
  'theguardian.com',
  'nytimes.com',
  'washingtonpost.com',
  'wsj.com',
  'bloomberg.com',
  'espn.com',
  'npr.org'
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

export const CACHE_TTL = {
  ARTICLES_LIST: 300, // 5 minutes
  ARTICLE_DETAIL: 600, // 10 minutes
  TRENDING_STATS: 60, // 1 minute
  USER_PROFILE: 300, // 5 minutes
  SEARCH_RESULTS: 180 // 3 minutes
};

export const RATE_LIMITS = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_WINDOW_MS: 900000, // 15 minutes
  AUTH_MAX_ATTEMPTS: 5
};

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

export const NEWSAPI_CONFIG = {
  BASE_URL: 'https://newsapi.org/v2',
  PAGE_SIZE: parseInt(process.env.NEWSAPI_PAGE_SIZE) || 100,
  MAX_PAGES: 10,
  TIMEOUT: 30000 // 30 seconds
};

export const TFIDF_CONFIG = {
  MAX_KEYWORDS: 5,
  MIN_KEYWORD_LENGTH: 3,
  MIN_TERM_FREQUENCY: 2,
  STOPWORDS: [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]
};

export const CATEGORY_KEYWORDS = {
  technology: ['tech', 'software', 'ai', 'artificial intelligence', 'machine learning', 
               'startup', 'google', 'microsoft', 'apple', 'facebook', 'amazon', 'tesla',
               'programming', 'coding', 'developer', 'app', 'mobile', 'internet'],
  business: ['business', 'market', 'stock', 'revenue', 'earnings', 'economy', 'finance',
             'investment', 'trading', 'cryptocurrency', 'bitcoin', 'company', 'corporate'],
  sports: ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'olympics',
           'nba', 'nfl', 'mlb', 'championship', 'tournament', 'match', 'game', 'player'],
  health: ['health', 'medical', 'doctor', 'hospital', 'covid', 'vaccine', 'treatment',
           'disease', 'medicine', 'drug', 'research', 'study', 'patient', 'surgery'],
  science: ['science', 'research', 'study', 'discovery', 'experiment', 'space', 'nasa',
            'climate', 'environment', 'nature', 'biology', 'chemistry', 'physics'],
  entertainment: ['movie', 'film', 'music', 'celebrity', 'show', 'television', 'netflix',
                  'hollywood', 'actor', 'actress', 'director', 'award', 'festival'],
  politics: ['politics', 'government', 'election', 'president', 'minister', 'congress',
             'parliament', 'policy', 'law', 'bill', 'vote', 'campaign', 'democracy']
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const SCHEDULED_JOBS = {
  FETCH_NEWS: 'fetch-news',
  CLEANUP_OLD_ARTICLES: 'cleanup-old-articles',
  UPDATE_TRENDING: 'update-trending'
};

export const CRON_SCHEDULES = {
  FETCH_NEWS: process.env.FETCH_NEWS_CRON || '0 */2 * * *', // Every 2 hours
  CLEANUP_ARTICLES: '0 2 * * *', // Daily at 2 AM
  UPDATE_TRENDING: '*/15 * * * *' // Every 15 minutes
};
