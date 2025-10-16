# cURL Examples for Personalized News Aggregator API

This document provides comprehensive cURL examples for testing the Personalized News Aggregator API endpoints.

## Base Configuration

```bash
# Set base URL
BASE_URL="http://localhost:4000"

# Set your access token (obtain from login)
ACCESS_TOKEN="your-access-token-here"
```

## Authentication Endpoints

### 1. Register User

```bash
curl -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login User

```bash
curl -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Refresh Token

```bash
curl -X POST "${BASE_URL}/api/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token-here"
  }'
```

### 4. Get User Profile

```bash
curl -X GET "${BASE_URL}/api/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### 5. Update Profile

```bash
curl -X PUT "${BASE_URL}/api/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "preferences": {
      "categories": ["technology", "science"],
      "language": "en"
    }
  }'
```

### 6. Change Password

```bash
curl -X POST "${BASE_URL}/api/auth/change-password" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 7. Forgot Password

```bash
curl -X POST "${BASE_URL}/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 8. Reset Password

```bash
curl -X POST "${BASE_URL}/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-here",
    "newPassword": "newpassword123"
  }'
```

### 9. Logout

```bash
curl -X POST "${BASE_URL}/api/auth/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Articles Endpoints

### 1. Fetch News (Admin Only)

```bash
curl -X POST "${BASE_URL}/api/articles/fetch" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["technology", "science"],
    "sources": ["techcrunch", "wired"],
    "pageSize": 50
  }'
```

### 2. List Articles (Basic)

```bash
curl -X GET "${BASE_URL}/api/articles?page=1&limit=20"
```

### 3. List Articles with Filters

```bash
curl -X GET "${BASE_URL}/api/articles?page=1&limit=20&category=technology&sortBy=publishedAt&sortOrder=desc"
```

### 4. List Articles with Advanced Filters

```bash
curl -X GET "${BASE_URL}/api/articles?tags=ai,machine-learning&search=artificial%20intelligence&dateFrom=2024-01-01&dateTo=2024-12-31"
```

### 5. Get Article by ID

```bash
curl -X GET "${BASE_URL}/api/articles/ARTICLE_ID_HERE"
```

### 6. Get Trending Articles

```bash
curl -X GET "${BASE_URL}/api/articles/trending?limit=10&period=7d"
```

## User Endpoints

### 1. Save Article

```bash
curl -X POST "${BASE_URL}/api/users/saved-articles" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "articleId": "ARTICLE_ID_HERE"
  }'
```

### 2. Get Saved Articles

```bash
curl -X GET "${BASE_URL}/api/users/saved-articles?page=1&limit=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### 3. Remove Saved Article

```bash
curl -X DELETE "${BASE_URL}/api/users/saved-articles/ARTICLE_ID_HERE" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### 4. Update User Interests

```bash
curl -X PUT "${BASE_URL}/api/users/interests" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["technology", "science"],
    "tags": ["ai", "machine-learning"],
    "sources": ["techcrunch", "wired"]
  }'
```

## Statistics Endpoints

### 1. Get Trending Categories

```bash
curl -X GET "${BASE_URL}/api/stats/trending/categories?limit=10&period=7d"
```

### 2. Get Trending Tags

```bash
curl -X GET "${BASE_URL}/api/stats/trending/tags?limit=20&period=30d"
```

### 3. Get Trending Sources

```bash
curl -X GET "${BASE_URL}/api/stats/trending/sources?limit=15&period=7d"
```

### 4. Get Top Articles

```bash
curl -X GET "${BASE_URL}/api/stats/trending/articles?limit=10&period=24h"
```

## Admin Endpoints

### 1. Health Check

```bash
curl -X GET "${BASE_URL}/api/admin/health" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### 2. Get Metrics

```bash
curl -X GET "${BASE_URL}/api/admin/metrics" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### 3. Trigger Fetch Job

```bash
curl -X POST "${BASE_URL}/api/admin/jobs/trigger" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "fetch",
    "params": {
      "categories": ["technology", "science"]
    }
  }'
```

### 4. Trigger Analytics Job

```bash
curl -X POST "${BASE_URL}/api/admin/jobs/trigger" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "analytics",
    "params": {}
  }'
```

### 5. Trigger Cleanup Job

```bash
curl -X POST "${BASE_URL}/api/admin/jobs/trigger" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobType": "cleanup",
    "params": {}
  }'
```

## Health Endpoints

### 1. API Health Check

```bash
curl -X GET "${BASE_URL}/api/health"
```

## Query Parameters Reference

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Sorting
- `sortBy`: Field to sort by (publishedAt, title, source.name)
- `sortOrder`: Sort order (asc, desc)

### Filtering
- `category`: Filter by category (technology, science, business, etc.)
- `tags`: Comma-separated tags (ai,machine-learning)
- `search`: Text search in title and description
- `dateFrom`: Start date (YYYY-MM-DD)
- `dateTo`: End date (YYYY-MM-DD)

### Statistics
- `period`: Time period (24h, 7d, 30d)
- `limit`: Number of results to return

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Success Responses

### Paginated Response
```json
{
  "data": [...],
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

### Single Item Response
```json
{
  "data": { ... }
}
```

## Authentication Flow

1. Register a new user or login with existing credentials
2. Extract the `accessToken` from the response
3. Include the token in the `Authorization` header for protected endpoints
4. Use the `refreshToken` to get a new access token when needed

## Rate Limiting

The API implements rate limiting. If you exceed the rate limit, you'll receive a 429 status code:

```bash
curl -X GET "${BASE_URL}/api/articles" \
  -H "X-RateLimit-Limit: 100" \
  -H "X-RateLimit-Remaining: 99" \
  -H "X-RateLimit-Reset: 1640995200"
```

## Testing Scripts

### Complete Authentication Flow

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"

# Register user
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Login user
echo "Logging in user..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo "Access token: $ACCESS_TOKEN"

# Test protected endpoint
echo "Testing protected endpoint..."
curl -X GET "${BASE_URL}/api/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Test All Endpoints

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"
ACCESS_TOKEN="your-access-token-here"

echo "Testing all endpoints..."

# Health check
echo "1. Health check..."
curl -X GET "${BASE_URL}/api/health"

# List articles
echo "2. List articles..."
curl -X GET "${BASE_URL}/api/articles?page=1&limit=5"

# Get trending categories
echo "3. Trending categories..."
curl -X GET "${BASE_URL}/api/stats/trending/categories?limit=5"

# Get profile (if authenticated)
echo "4. User profile..."
curl -X GET "${BASE_URL}/api/auth/profile" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"

echo "Testing complete!"
```
