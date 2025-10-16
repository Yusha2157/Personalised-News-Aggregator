import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Article } from '../models/Article.js';

// Load environment variables
config();

const createSampleArticles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/news-aggregator');
    console.log('Connected to MongoDB');

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles');

    // Create sample articles
    const sampleArticles = [
      {
        title: 'Revolutionary AI Technology Transforms Healthcare Industry',
        description: 'New artificial intelligence systems are revolutionizing patient care and medical diagnosis, leading to improved outcomes and reduced costs.',
        url: 'https://example.com/ai-healthcare-revolution',
        source: {
          id: 'tech-news',
          name: 'Tech News Daily'
        },
        author: 'Dr. Sarah Johnson',
        category: 'technology',
        tags: ['artificial intelligence', 'healthcare', 'innovation', 'medical technology'],
        publishedAt: new Date('2025-01-15T10:00:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      },
      {
        title: 'Global Markets Rally as Economic Recovery Accelerates',
        description: 'Stock markets worldwide show strong performance as economic indicators point to sustained recovery and growth.',
        url: 'https://example.com/global-markets-rally',
        source: {
          id: 'business-week',
          name: 'Business Week'
        },
        author: 'Michael Chen',
        category: 'business',
        tags: ['stock market', 'economy', 'recovery', 'finance'],
        publishedAt: new Date('2025-01-15T09:30:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      },
      {
        title: 'Olympic Athletes Break Multiple World Records',
        description: 'Athletes from around the world set new records in swimming, track and field events at the international championships.',
        url: 'https://example.com/olympic-records-broken',
        source: {
          id: 'sports-central',
          name: 'Sports Central'
        },
        author: 'Emma Rodriguez',
        category: 'sports',
        tags: ['olympics', 'world records', 'athletics', 'swimming'],
        publishedAt: new Date('2025-01-15T08:15:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      },
      {
        title: 'Breakthrough in Renewable Energy Storage Technology',
        description: 'Scientists develop new battery technology that could revolutionize renewable energy storage and make clean energy more accessible.',
        url: 'https://example.com/renewable-energy-breakthrough',
        source: {
          id: 'science-daily',
          name: 'Science Daily'
        },
        author: 'Prof. David Kim',
        category: 'science',
        tags: ['renewable energy', 'battery technology', 'clean energy', 'innovation'],
        publishedAt: new Date('2025-01-15T07:45:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      },
      {
        title: 'New Study Reveals Benefits of Mediterranean Diet',
        description: 'Research shows that following a Mediterranean diet can significantly reduce the risk of heart disease and improve longevity.',
        url: 'https://example.com/mediterranean-diet-study',
        source: {
          id: 'health-news',
          name: 'Health News Today'
        },
        author: 'Dr. Lisa Martinez',
        category: 'health',
        tags: ['nutrition', 'heart health', 'longevity', 'diet'],
        publishedAt: new Date('2025-01-15T06:20:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      },
      {
        title: 'Hollywood Announces Major Streaming Platform Partnership',
        description: 'Major studios join forces to create a new streaming platform that will compete with existing services.',
        url: 'https://example.com/hollywood-streaming-partnership',
        source: {
          id: 'entertainment-weekly',
          name: 'Entertainment Weekly'
        },
        author: 'James Wilson',
        category: 'entertainment',
        tags: ['streaming', 'hollywood', 'partnership', 'entertainment'],
        publishedAt: new Date('2025-01-15T05:10:00Z'),
        fetchedAt: new Date(),
        meta: {
          views: 0,
          saves: 0,
          shares: 0,
          score: 0
        }
      }
    ];

    // Insert sample articles
    await Article.insertMany(sampleArticles);
    console.log(`Created ${sampleArticles.length} sample articles`);

    console.log('\n✅ Sample articles created successfully!');
    console.log('\n📰 Sample articles include:');
    sampleArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.category})`);
    });

  } catch (error) {
    console.error('Error creating sample articles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the function
createSampleArticles();
