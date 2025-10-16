# Personalized News Aggregator API Documentation

## Overview

The Personalized News Aggregator API is a comprehensive backend service that provides news aggregation, user management, and analytics capabilities. Built with Node.js, Express, MongoDB, and Redis.

## Base URL

```
http://localhost:4000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Admin endpoints**: 50 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

#### Get Profile
```http
GET /auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "preferences": {
      "categories": ["technology", "science"],
      "language": "en"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferences": {
    "categories": ["technology", "science"],
    "language": "en"
  }
}
```

#### Change Password
```http
POST /auth/change-password
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /auth/logout
```

**Headers:**
- `Authorization: Bearer <token>`

### Articles

#### Fetch News (Admin Only)
```http
POST /articles/fetch
```

**Headers:**
- `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "categories": ["technology", "science"],
  "sources": ["techcrunch", "wired"],
  "pageSize": 50
}
```

**Response:**
```json
{
  "message": "News fetch job started",
  "jobId": "job_id"
}
```

#### List Articles
```http
GET /articles
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `category` (string) - Filter by category
- `tags` (string) - Comma-separated tags
- `search` (string) - Search in title and description
- `sortBy` (string) - Sort field (publishedAt, title, source.name)
- `sortOrder` (string) - Sort order (asc, desc)
- `dateFrom` (string) - Start date (YYYY-MM-DD)
- `dateTo` (string) - End date (YYYY-MM-DD)

**Response:**
```json
{
  "data": [
    {
      "id": "article_id",
      "title": "Article Title",
      "description": "Article description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "source": {
        "id": "source_id",
        "name": "Source Name"
      },
      "category": "technology",
      "tags": ["ai", "machine-learning"],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "fetchedAt": "2024-01-15T10:05:00.000Z",
      "meta": {
        "wordCount": 500,
        "readingTime": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

#### Get Article by ID
```http
GET /articles/:id
```

**Response:**
```json
{
  "data": {
    "id": "article_id",
    "title": "Article Title",
    "description": "Article description",
    "url": "https://example.com/article",
    "urlToImage": "https://example.com/image.jpg",
    "source": {
      "id": "source_id",
      "name": "Source Name"
    },
    "category": "technology",
    "tags": ["ai", "machine-learning"],
    "publishedAt": "2024-01-15T10:00:00.000Z",
    "fetchedAt": "2024-01-15T10:05:00.000Z",
    "meta": {
      "wordCount": 500,
      "readingTime": 3
    }
  }
}
```

#### Get Trending Articles
```http
GET /articles/trending
```

**Query Parameters:**
- `limit` (number, default: 10) - Number of articles
- `period` (string, default: 7d) - Time period (24h, 7d, 30d)

**Response:**
```json
{
  "data": [
    {
      "id": "article_id",
      "title": "Trending Article",
      "description": "Article description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "source": {
        "id": "source_id",
        "name": "Source Name"
      },
      "category": "technology",
      "tags": ["ai", "machine-learning"],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "trendingScore": 95.5
    }
  ],
  "period": "7d"
}
```

### Users

#### Save Article
```http
POST /users/saved-articles
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "articleId": "article_id"
}
```

**Response:**
```json
{
  "message": "Article saved successfully",
  "savedArticle": {
    "id": "saved_article_id",
    "userId": "user_id",
    "articleId": "article_id",
    "savedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get Saved Articles
```http
GET /users/saved-articles
```

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "saved_article_id",
      "article": {
        "id": "article_id",
        "title": "Article Title",
        "description": "Article description",
        "url": "https://example.com/article",
        "urlToImage": "https://example.com/image.jpg",
        "source": {
          "id": "source_id",
          "name": "Source Name"
        },
        "category": "technology",
        "tags": ["ai", "machine-learning"],
        "publishedAt": "2024-01-15T10:00:00.000Z"
      },
      "savedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Remove Saved Article
```http
DELETE /users/saved-articles/:articleId
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Article removed from saved list"
}
```

#### Update Interests
```http
PUT /users/interests
```

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "categories": ["technology", "science"],
  "tags": ["ai", "machine-learning"],
  "sources": ["techcrunch", "wired"]
}
```

**Response:**
```json
{
  "message": "Interests updated successfully",
  "user": {
    "id": "user_id",
    "preferences": {
      "categories": ["technology", "science"],
      "tags": ["ai", "machine-learning"],
      "sources": ["techcrunch", "wired"]
    }
  }
}
```

### Statistics

#### Get Trending Categories
```http
GET /stats/trending/categories
```

**Query Parameters:**
- `limit` (number, default: 10) - Number of categories
- `period` (string, default: 7d) - Time period (24h, 7d, 30d)

**Response:**
```json
{
  "data": [
    {
      "category": "technology",
      "count": 150,
      "trendingScore": 95.5
    },
    {
      "category": "science",
      "count": 120,
      "trendingScore": 88.2
    }
  ],
  "period": "7d"
}
```

#### Get Trending Tags
```http
GET /stats/trending/tags
```

**Query Parameters:**
- `limit` (number, default: 20) - Number of tags
- `period` (string, default: 7d) - Time period (24h, 7d, 30d)

**Response:**
```json
{
  "data": [
    {
      "tag": "ai",
      "count": 200,
      "trendingScore": 98.5
    },
    {
      "tag": "machine-learning",
      "count": 180,
      "trendingScore": 92.3
    }
  ],
  "period": "7d"
}
```

#### Get Trending Sources
```http
GET /stats/trending/sources
```

**Query Parameters:**
- `limit` (number, default: 15) - Number of sources
- `period` (string, default: 7d) - Time period (24h, 7d, 30d)

**Response:**
```json
{
  "data": [
    {
      "source": {
        "id": "techcrunch",
        "name": "TechCrunch"
      },
      "count": 300,
      "trendingScore": 96.8
    },
    {
      "source": {
        "id": "wired",
        "name": "Wired"
      },
      "count": 250,
      "trendingScore": 89.4
    }
  ],
  "period": "7d"
}
```

#### Get Top Articles
```http
GET /stats/trending/articles
```

**Query Parameters:**
- `limit` (number, default: 10) - Number of articles
- `period` (string, default: 24h) - Time period (24h, 7d, 30d)

**Response:**
```json
{
  "data": [
    {
      "id": "article_id",
      "title": "Top Article",
      "description": "Article description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "source": {
        "id": "source_id",
        "name": "Source Name"
      },
      "category": "technology",
      "tags": ["ai", "machine-learning"],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "trendingScore": 99.2
    }
  ],
  "period": "24h"
}
```

### Admin

#### Health Check
```http
GET /admin/health
```

**Headers:**
- `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected",
    "newsapi": "available"
  }
}
```

#### Get Metrics
```http
GET /admin/metrics
```

**Headers:**
- `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "metrics": {
    "articles": {
      "total": 10000,
      "today": 150,
      "categories": {
        "technology": 4000,
        "science": 3000,
        "business": 2000,
        "health": 1000
      }
    },
    "users": {
      "total": 500,
      "active": 300,
      "newToday": 25
    },
    "performance": {
      "avgResponseTime": 150,
      "requestsPerMinute": 120,
      "errorRate": 0.02
    }
  },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

#### Trigger Job
```http
POST /admin/jobs/trigger
```

**Headers:**
- `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "jobType": "fetch",
  "params": {
    "categories": ["technology", "science"]
  }
}
```

**Response:**
```json
{
  "message": "Job triggered successfully",
  "jobId": "job_id",
  "jobType": "fetch",
  "status": "started"
}
```

### Health

#### API Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 3600
}
```

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "user | admin",
  "preferences": {
    "categories": ["string"],
    "tags": ["string"],
    "sources": ["string"],
    "language": "string"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Article
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "url": "string",
  "urlToImage": "string",
  "source": {
    "id": "string",
    "name": "string"
  },
  "category": "string",
  "tags": ["string"],
  "publishedAt": "datetime",
  "fetchedAt": "datetime",
  "meta": {
    "wordCount": "number",
    "readingTime": "number"
  }
}
```

### SavedArticle
```json
{
  "id": "string",
  "userId": "string",
  "articleId": "string",
  "savedAt": "datetime"
}
```

### AnalyticsEvent
```json
{
  "id": "string",
  "type": "view | save | share",
  "userId": "string",
  "articleId": "string",
  "category": "string",
  "tag": "string",
  "source": "string",
  "timestamp": "datetime"
}
```

## Webhooks

### Article Saved
```json
{
  "event": "article.saved",
  "data": {
    "userId": "string",
    "articleId": "string",
    "savedAt": "datetime"
  },
  "timestamp": "datetime"
}
```

### Article Viewed
```json
{
  "event": "article.viewed",
  "data": {
    "userId": "string",
    "articleId": "string",
    "viewedAt": "datetime"
  },
  "timestamp": "datetime"
}
```

## SDKs and Libraries

### JavaScript/Node.js
```javascript
const NewsAPI = require('news-aggregator-sdk');

const client = new NewsAPI({
  baseURL: 'http://localhost:4000/api',
  apiKey: 'your-api-key'
});

// Get articles
const articles = await client.articles.list({
  category: 'technology',
  limit: 10
});

// Save article
await client.users.saveArticle('article-id');
```

### Python
```python
from news_aggregator import NewsAPIClient

client = NewsAPIClient(
    base_url='http://localhost:4000/api',
    api_key='your-api-key'
)

# Get articles
articles = client.articles.list(
    category='technology',
    limit=10
)

# Save article
client.users.save_article('article-id')
```

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| General | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Admin | 50 requests | 15 minutes |
| Statistics | 200 requests | 15 minutes |

## Changelog

### Version 2.0.0
- Complete rewrite with JWT authentication
- Added comprehensive analytics
- Improved caching with Redis
- Enhanced security measures
- Added rate limiting
- Comprehensive test coverage

### Version 1.0.0
- Initial release
- Basic news aggregation
- User management
- Session-based authentication

## Support

For support and questions:
- Email: support@newsaggregator.com
- Documentation: https://docs.newsaggregator.com
- GitHub Issues: https://github.com/your-repo/issues
