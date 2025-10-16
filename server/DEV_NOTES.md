# Developer Notes - Personalized News Aggregator - Sigma Edition

## Architecture Decisions

### TF-IDF Implementation
The TF-IDF (Term Frequency-Inverse Document Frequency) implementation in `taggerService.js` uses a simplified approach suitable for MVP:

**Current Implementation:**
- Uses the `natural` library's Porter Stemmer for text processing
- Calculates term frequency from article text (title + description)
- Implements a simplified IDF calculation using a document corpus
- Extracts top 5 keywords with configurable parameters

**Reasoning:**
- Full TF-IDF implementation would require maintaining a large corpus of documents
- Simplified approach provides good keyword extraction for news articles
- Performance optimized for real-time processing
- Can be enhanced with machine learning models in future iterations

**Future Enhancements:**
- Implement proper IDF calculation with larger corpus
- Add named entity recognition (NER)
- Integrate with external NLP APIs (OpenAI, Google NLP)
- Implement topic modeling (LDA, BERT)

### Deduplication Strategy
The deduplication service uses a two-tier approach:

**Primary Deduplication (URL-based):**
- Generates SHA-256 hash of normalized URL
- Removes tracking parameters and normalizes format
- Fast lookup using Redis cache

**Secondary Deduplication (Content-based):**
- Generates hash from title + source + published date
- Prevents duplicate content from different URLs
- Uses Jaccard similarity for fuzzy matching

**Reasoning:**
- URL-based deduplication catches exact duplicates quickly
- Content-based deduplication prevents cross-source duplicates
- Caching reduces database queries
- Similarity threshold (0.8) balances precision and recall

### Cache Invalidation Strategy
Cache invalidation follows a pattern-based approach:

**Invalidation Triggers:**
- New articles fetched → invalidate `articles:*`, `trending:*`
- User saves article → invalidate user-specific caches
- Analytics update → invalidate `trending:*`, `analytics:*`

**Cache Keys Structure:**
```
articles:page:1:limit:20:category:technology
articles:search:ai:page:1:limit:10
trending:7:10
user:stats:userId
```

**Reasoning:**
- Pattern-based invalidation ensures consistency
- Hierarchical cache keys enable selective invalidation
- TTL-based expiration provides fallback consistency
- Redis pattern matching enables efficient bulk operations

### Rate Limiting Implementation
Rate limiting uses Redis for distributed rate limiting:

**Implementation:**
- Sliding window algorithm using Redis sorted sets
- Per-IP and per-user rate limits
- Different limits for different endpoint types
- Graceful degradation when Redis unavailable

**Rate Limits:**
- General API: 100 requests/minute
- Authentication: 5 attempts/15 minutes
- Search: 30 requests/minute
- Admin operations: 10 requests/hour

**Reasoning:**
- Distributed rate limiting prevents abuse across multiple instances
- Different limits for different operations provide flexibility
- Redis-based implementation scales horizontally
- Graceful degradation ensures service availability

## Database Design

### Indexing Strategy
Optimized indexes for common query patterns:

**Article Indexes:**
```javascript
// Text search
{ title: 'text', description: 'text', content: 'text', tags: 'text' }

// Filtering and sorting
{ publishedAt: -1, category: 1 }
{ publishedAt: -1, 'source.name': 1 }
{ isActive: 1, publishedAt: -1 }

// Performance
{ url: 1 } // Unique constraint
{ tags: 1 } // Multi-key index
```

**User Indexes:**
```javascript
{ email: 1 } // Unique constraint
{ role: 1 }
{ isActive: 1 }
```

**SavedArticle Indexes:**
```javascript
{ userId: 1, savedAt: -1 }
{ userId: 1, articleId: 1 } // Unique constraint
{ category: 1, savedAt: -1 }
```

### Data Retention Policy
Configurable retention periods for different data types:

- **Articles**: 90 days (configurable via `ARTICLE_RETENTION_DAYS`)
- **Analytics**: 90 days (configurable via `ANALYTICS_RETENTION_DAYS`)
- **Saved Articles**: 365 days (configurable via `SAVED_ARTICLES_RETENTION_DAYS`)

Articles are soft-deleted (marked as inactive) rather than hard-deleted to preserve referential integrity.

## Security Considerations

### Authentication Flow
JWT-based authentication with refresh tokens:

1. **Login**: Returns access token (24h) + refresh token (7d)
2. **Token Refresh**: Uses refresh token to get new access token
3. **Logout**: Client removes tokens (server-side blacklisting optional)

### Password Security
- bcrypt with 12 salt rounds
- Minimum 6 characters (configurable)
- Password strength validation
- Account lockout after 5 failed attempts (2-hour lockout)

### Input Validation
- Joi schemas for all endpoints
- HTML sanitization for user input
- MongoDB injection prevention via Mongoose
- XSS protection via Helmet.js

## Performance Optimizations

### Database Optimizations
- Connection pooling (max 10 connections)
- Query optimization with proper indexes
- Aggregation pipelines for analytics
- Bulk operations for data imports

### Caching Strategy
- Redis for application-level caching
- In-memory caching for frequently accessed data
- Cache warming for trending data
- Intelligent cache invalidation

### Background Jobs
- Non-blocking news fetching
- Scheduled cleanup operations
- Analytics computation
- Cache warming

## Monitoring and Observability

### Logging Strategy
- Structured logging with Winston
- Request/response logging with correlation IDs
- Error logging with stack traces
- Performance metrics logging

### Health Checks
- Database connectivity
- Redis connectivity
- External API availability
- Job status monitoring

### Metrics Collection
- Request counts and latencies
- Cache hit/miss ratios
- Database query performance
- Error rates and types

## Extension Points

### Chatbot Integration
The architecture is designed for easy chatbot integration:

**Current Foundation:**
- Text processing utilities (`textCleaner.js`)
- TF-IDF implementation for content understanding
- User preference tracking
- Article categorization

**Integration Points:**
1. **NLP Pipeline**: Extend `taggerService.js` with chatbot-specific NLP
2. **Conversation Management**: Add conversation state to User model
3. **Intent Recognition**: Implement intent classification
4. **Response Generation**: Add response generation service

**Recommended Approach:**
```javascript
// Future chatbot service structure
class ChatbotService {
  async processMessage(userId, message) {
    const intent = await this.classifyIntent(message);
    const context = await this.getUserContext(userId);
    const response = await this.generateResponse(intent, context);
    return response;
  }
}
```

### Additional News Sources
Easy integration of new news sources:

1. **Extend NewsService**: Add new source-specific methods
2. **Implement Normalization**: Create source-specific data normalizers
3. **Add Source Configuration**: Update constants and configuration
4. **Update Validation**: Add source-specific validation rules

### Machine Learning Integration
Ready for ML model integration:

1. **Feature Extraction**: Current TF-IDF can be enhanced with ML features
2. **Recommendation Engine**: User preferences and behavior data available
3. **Content Classification**: Current categorization can be ML-powered
4. **Sentiment Analysis**: Text processing pipeline ready for sentiment models

## Troubleshooting

### Common Issues

**High Memory Usage:**
- Check for memory leaks in long-running processes
- Monitor Redis memory usage
- Review MongoDB connection pool size
- Check for unbounded data growth

**Slow Query Performance:**
- Review database indexes
- Check query execution plans
- Monitor slow query logs
- Optimize aggregation pipelines

**Cache Miss Issues:**
- Check Redis connectivity
- Verify cache key generation
- Review cache TTL settings
- Monitor cache invalidation patterns

**Rate Limiting Issues:**
- Check Redis connectivity
- Verify rate limit configuration
- Review rate limit key generation
- Check for clock synchronization issues

### Debug Mode
Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Performance Profiling
Enable performance monitoring:
```bash
ENABLE_PERFORMANCE_MONITORING=true npm run dev
```

## Deployment Considerations

### Production Checklist
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Redis configured with persistence
- [ ] Log rotation configured
- [ ] Health checks implemented
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] SSL/TLS configured
- [ ] Rate limiting configured
- [ ] CORS properly configured

### Scaling Considerations
- **Horizontal Scaling**: Stateless application design enables horizontal scaling
- **Database Scaling**: Consider read replicas for analytics queries
- **Cache Scaling**: Redis Cluster for high availability
- **Load Balancing**: Use sticky sessions for WebSocket connections (if added)

### Backup Strategy
- **Database**: Regular MongoDB backups with point-in-time recovery
- **Redis**: RDB snapshots and AOF for persistence
- **Logs**: Centralized logging with log aggregation
- **Configuration**: Version-controlled configuration management

---

This document provides insight into the architectural decisions and implementation details of the Personalized News Aggregator - Sigma Edition. For questions or clarifications, please refer to the code comments or create an issue in the repository.
