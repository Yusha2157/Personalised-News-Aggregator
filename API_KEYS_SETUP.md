# API Keys Setup for Live News Aggregator

This document explains how to set up API keys for the live news aggregator to fetch real-time news from multiple sources.

## Available News Sources

### 1. BBC News (✅ Working - No API Key Required)
- **Status**: Always available
- **Coverage**: International news, technology, business, sports
- **API**: RSS feeds (no authentication required)

### 2. NewsAPI.org (🔑 API Key Required)
- **Website**: https://newsapi.org/
- **Coverage**: 80,000+ articles from 80,000+ sources
- **Free Tier**: 1,000 requests/day
- **Setup**:
  1. Sign up at https://newsapi.org/
  2. Get your API key from the dashboard
  3. Add to `.env` file: `NEWSAPI_KEY=your-api-key-here`

### 3. The Guardian API (🔑 API Key Required)
- **Website**: https://open-platform.theguardian.com/
- **Coverage**: Guardian's complete news archive
- **Free Tier**: 5,000 requests/day
- **Setup**:
  1. Sign up at https://open-platform.theguardian.com/
  2. Create a new API key
  3. Add to `.env` file: `GUARDIAN_API_KEY=your-api-key-here`

### 4. New York Times API (🔑 API Key Required)
- **Website**: https://developer.nytimes.com/
- **Coverage**: NYT articles and multimedia
- **Free Tier**: 4,000 requests/day
- **Setup**:
  1. Sign up at https://developer.nytimes.com/
  2. Create an app and get API key
  3. Add to `.env` file: `NYT_API_KEY=your-api-key-here`

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Add your API keys to the `.env` file:
   ```env
   NEWSAPI_KEY=your-newsapi-key-here
   GUARDIAN_API_KEY=your-guardian-api-key-here
   NYT_API_KEY=your-nyt-api-key-here
   ```

3. Restart the server:
   ```bash
   npm start
   ```

## Testing API Keys

Check the health of all services:
```bash
curl http://localhost:4000/api/live-news/health
```

Expected response with API keys configured:
```json
{
  "success": true,
  "data": {
    "services": {
      "NewsAPI": {"status": "healthy", "articlesCount": 20},
      "Guardian": {"status": "healthy", "articlesCount": 20},
      "NYT": {"status": "healthy", "articlesCount": 20},
      "BBC": {"status": "healthy", "articlesCount": 20}
    }
  }
}
```

## Current Status

- **BBC News**: ✅ Working (no API key needed)
- **NewsAPI**: 🔑 Needs API key
- **Guardian**: 🔑 Needs API key  
- **NYT**: 🔑 Needs API key

## Features Working Without API Keys

Even without API keys, the system provides:
- ✅ BBC News live feed
- ✅ Local database articles (33 articles)
- ✅ Search functionality
- ✅ Category filtering
- ✅ Save articles
- ✅ Trending analytics
- ✅ Smart chatbot

## Features Enhanced With API Keys

With API keys configured, you get:
- 🚀 **4x more news sources** (80,000+ articles)
- 🚀 **Real-time breaking news** from multiple sources
- 🚀 **Deduplication** across sources
- 🚀 **Intelligent ranking** by source credibility
- 🚀 **Comprehensive coverage** of all topics

## Demo Mode

The app works perfectly for college demos even without API keys:
- Shows live BBC news
- Demonstrates all functionality
- Professional UI/UX
- Full feature set

## Production Recommendations

For production deployment:
1. Get all 3 API keys for maximum coverage
2. Set up proper rate limiting
3. Implement caching strategies
4. Monitor API usage
5. Set up error handling and fallbacks
