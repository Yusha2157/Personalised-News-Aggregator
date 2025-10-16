/**
 * Tagging Service for Personalized News Aggregator
 * TF-IDF based keyword extraction and tagging
 */

import natural from 'natural';
import { logger } from '../config/logger.js';
import { textCleaner } from '../utils/textCleaner.js';
import { TFIDF_CONFIG, CATEGORY_KEYWORDS } from '../config/constants.js';

class TaggerService {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.corpus = new Map(); // Document corpus for IDF calculation
    this.stopwords = new Set(TFIDF_CONFIG.STOPWORDS);
    this.maxKeywords = TFIDF_CONFIG.MAX_KEYWORDS;
    this.minKeywordLength = TFIDF_CONFIG.MIN_KEYWORD_LENGTH;
    this.minTermFrequency = TFIDF_CONFIG.MIN_TERM_FREQUENCY;
    
    // Initialize stemmer and tokenizer
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    
    // Category keyword mapping for fallback tagging
    this.categoryKeywords = CATEGORY_KEYWORDS;
  }

  /**
   * Extract tags from article title and description
   * @param {string} title - Article title
   * @param {string} description - Article description
   * @returns {Promise<string[]>} Array of extracted tags
   */
  async extractTags(title, description) {
    try {
      const text = `${title} ${description}`;
      
      // Clean and normalize text
      const cleanedText = textCleaner.clean(text);
      
      // Extract keywords using TF-IDF
      const keywords = await this.extractKeywords(cleanedText);
      
      // Map keywords to categories for additional context
      const categoryTags = this.mapToCategories(keywords, cleanedText);
      
      // Combine and deduplicate tags
      const allTags = [...keywords, ...categoryTags];
      const uniqueTags = [...new Set(allTags)];
      
      // Filter and limit tags
      const filteredTags = this.filterTags(uniqueTags);
      
      logger.debug(`Extracted ${filteredTags.length} tags from text: ${title.substring(0, 50)}...`);
      
      return filteredTags.slice(0, this.maxKeywords);
    } catch (error) {
      logger.error('Error extracting tags:', error);
      return this.getFallbackTags(title, description);
    }
  }

  /**
   * Extract keywords using TF-IDF
   */
  async extractKeywords(text) {
    try {
      // Tokenize and clean text
      const tokens = this.tokenizer.tokenize(text);
      const cleanedTokens = tokens
        .filter(token => this.isValidToken(token))
        .map(token => this.stemmer.stem(token.toLowerCase()));

      // Calculate term frequencies
      const termFreq = new Map();
      for (const token of cleanedTokens) {
        termFreq.set(token, (termFreq.get(token) || 0) + 1);
      }

      // Filter by minimum frequency
      const filteredTerms = Array.from(termFreq.entries())
        .filter(([term, freq]) => freq >= this.minTermFrequency)
        .sort((a, b) => b[1] - a[1]); // Sort by frequency

      // Convert to TF-IDF scores (simplified)
      const tfidfScores = await this.calculateTfIdfScores(filteredTerms, text);

      // Sort by TF-IDF score and extract top keywords
      const topKeywords = tfidfScores
        .sort((a, b) => b.score - a.score)
        .slice(0, this.maxKeywords)
        .map(item => item.term);

      return topKeywords;
    } catch (error) {
      logger.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Calculate TF-IDF scores for terms
   */
  async calculateTfIdfScores(terms, documentText) {
    const scores = [];
    
    for (const [term, tf] of terms) {
      // Calculate IDF (Inverse Document Frequency)
      const idf = await this.calculateIdf(term);
      
      // TF-IDF score = TF * IDF
      const score = tf * idf;
      
      scores.push({ term, score, tf, idf });
    }

    return scores;
  }

  /**
   * Calculate IDF for a term
   */
  async calculateIdf(term) {
    try {
      // Get document frequency from corpus
      const docFreq = this.corpus.get(term) || 1;
      const totalDocs = Math.max(this.corpus.size, 1);
      
      // IDF = log(total_documents / document_frequency)
      return Math.log(totalDocs / docFreq);
    } catch (error) {
      logger.error('Error calculating IDF:', error);
      return 1; // Default IDF value
    }
  }

  /**
   * Map keywords to categories
   */
  mapToCategories(keywords, text) {
    const categoryTags = [];
    
    for (const [category, categoryKeywords] of Object.entries(this.categoryKeywords)) {
      // Check if any keyword matches category keywords
      const hasMatch = keywords.some(keyword => 
        categoryKeywords.some(catKeyword => 
          keyword.includes(catKeyword.toLowerCase()) || 
          catKeyword.toLowerCase().includes(keyword)
        )
      );

      if (hasMatch) {
        categoryTags.push(category);
      }
    }

    return categoryTags;
  }

  /**
   * Filter tags based on quality criteria
   */
  filterTags(tags) {
    return tags
      .filter(tag => tag.length >= this.minKeywordLength)
      .filter(tag => !this.stopwords.has(tag.toLowerCase()))
      .filter(tag => !this.isCommonWord(tag))
      .filter(tag => this.isMeaningfulTag(tag));
  }

  /**
   * Check if token is valid for processing
   */
  isValidToken(token) {
    // Remove punctuation and check length
    const cleanToken = token.replace(/[^\w]/g, '');
    
    return cleanToken.length >= this.minKeywordLength &&
           !this.stopwords.has(cleanToken.toLowerCase()) &&
           !/^\d+$/.test(cleanToken); // Not just numbers
  }

  /**
   * Check if word is too common to be a meaningful tag
   */
  isCommonWord(word) {
    const commonWords = [
      'said', 'say', 'says', 'new', 'news', 'report', 'reports',
      'year', 'years', 'day', 'days', 'time', 'times', 'people',
      'world', 'country', 'state', 'city', 'government', 'company',
      'business', 'market', 'money', 'million', 'billion', 'percent'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }

  /**
   * Check if tag is meaningful
   */
  isMeaningfulTag(tag) {
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(tag)) return false;
    
    // Must not be just common suffixes/prefixes
    const meaningless = ['the', 'and', 'or', 'but', 'for', 'with', 'from', 'this', 'that'];
    if (meaningless.includes(tag.toLowerCase())) return false;
    
    return true;
  }

  /**
   * Get fallback tags when extraction fails
   */
  getFallbackTags(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const fallbackTags = [];

    // Simple keyword matching as fallback
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        fallbackTags.push(category);
      }
    }

    // Extract simple noun phrases as tags
    const words = text.split(/\s+/)
      .filter(word => word.length >= 4 && /[a-zA-Z]/.test(word))
      .slice(0, 3);

    return [...fallbackTags, ...words].slice(0, this.maxKeywords);
  }

  /**
   * Update corpus with new documents
   */
  async updateCorpus(documents) {
    try {
      for (const doc of documents) {
        const text = `${doc.title} ${doc.description}`.toLowerCase();
        const tokens = this.tokenizer.tokenize(text);
        
        for (const token of tokens) {
          const cleanedToken = this.stemmer.stem(token.toLowerCase());
          this.corpus.set(cleanedToken, (this.corpus.get(cleanedToken) || 0) + 1);
        }
      }

      logger.info(`Updated corpus with ${documents.length} documents`);
    } catch (error) {
      logger.error('Error updating corpus:', error);
    }
  }

  /**
   * Get tagging statistics
   */
  getStats() {
    return {
      corpusSize: this.corpus.size,
      maxKeywords: this.maxKeywords,
      minKeywordLength: this.minKeywordLength,
      minTermFrequency: this.minTermFrequency,
      stopwordsCount: this.stopwords.size
    };
  }

  /**
   * Clear corpus and reset state
   */
  clearCorpus() {
    this.corpus.clear();
    logger.info('Tagger service corpus cleared');
  }

  /**
   * Initialize tagger service with existing articles
   */
  async initialize() {
    try {
      const { Article } = await import('../models/Article.js');
      
      // Load recent articles to build initial corpus
      const recentArticles = await Article.find({ isActive: true })
        .select('title description')
        .sort({ publishedAt: -1 })
        .limit(1000)
        .lean();

      if (recentArticles.length > 0) {
        await this.updateCorpus(recentArticles);
        logger.info(`Tagger service initialized with ${recentArticles.length} articles`);
      }
    } catch (error) {
      logger.error('Error initializing tagger service:', error);
    }
  }
}

export const taggerService = new TaggerService();
