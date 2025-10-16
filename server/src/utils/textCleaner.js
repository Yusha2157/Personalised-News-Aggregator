/**
 * Text Cleaning Utilities for Personalized News Aggregator
 * Text preprocessing and normalization functions
 */

import natural from 'natural';

class TextCleaner {
  constructor() {
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
  }

  /**
   * Clean and normalize text
   * @param {string} text - Input text
   * @returns {string} Cleaned text
   */
  clean(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Remove HTML tags
    let cleaned = this.removeHtmlTags(text);
    
    // Decode HTML entities
    cleaned = this.decodeHtmlEntities(cleaned);
    
    // Normalize whitespace
    cleaned = this.normalizeWhitespace(cleaned);
    
    // Remove special characters but keep basic punctuation
    cleaned = this.removeSpecialCharacters(cleaned);
    
    // Trim and return
    return cleaned.trim();
  }

  /**
   * Remove HTML tags from text
   */
  removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Decode HTML entities
   */
  decodeHtmlEntities(text) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&apos;': "'",
      '&hellip;': '...',
      '&mdash;': '—',
      '&ndash;': '–',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™'
    };

    let decoded = text;
    for (const [entity, replacement] of Object.entries(entities)) {
      decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
    }

    // Handle numeric entities
    decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(dec);
    });

    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return decoded;
  }

  /**
   * Normalize whitespace
   */
  normalizeWhitespace(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  /**
   * Remove special characters but keep basic punctuation
   */
  removeSpecialCharacters(text) {
    // Keep letters, numbers, basic punctuation, and spaces
    return text.replace(/[^\w\s.,!?;:'"-]/g, '');
  }

  /**
   * Extract sentences from text
   */
  extractSentences(text) {
    const cleaned = this.clean(text);
    return this.sentenceTokenizer.tokenize(cleaned);
  }

  /**
   * Extract words from text
   */
  extractWords(text) {
    const cleaned = this.clean(text);
    return this.tokenizer.tokenize(cleaned);
  }

  /**
   * Get word count
   */
  getWordCount(text) {
    const words = this.extractWords(text);
    return words.length;
  }

  /**
   * Get character count
   */
  getCharacterCount(text) {
    return this.clean(text).length;
  }

  /**
   * Get reading time estimation (words per minute)
   */
  getReadingTime(text, wordsPerMinute = 200) {
    const wordCount = this.getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Extract keywords using simple frequency analysis
   */
  extractKeywords(text, maxKeywords = 10) {
    const words = this.extractWords(text)
      .map(word => word.toLowerCase())
      .filter(word => word.length >= 3) // Minimum word length
      .filter(word => !this.isStopWord(word));

    // Count word frequencies
    const wordCount = {};
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);

    return stopWords.has(word.toLowerCase());
  }

  /**
   * Stem words using Porter stemmer
   */
  stemWords(words) {
    return words.map(word => this.stemmer.stem(word));
  }

  /**
   * Normalize text for comparison
   */
  normalize(text) {
    return this.clean(text)
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Calculate text similarity using Jaccard similarity
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(this.normalize(text1).split(' '));
    const words2 = new Set(this.normalize(text2).split(' '));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Truncate text to specified length
   */
  truncate(text, maxLength = 100, suffix = '...') {
    const cleaned = this.clean(text);
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }

    return truncated + suffix;
  }

  /**
   * Extract summary from text
   */
  extractSummary(text, maxSentences = 3) {
    const sentences = this.extractSentences(text);
    
    if (sentences.length <= maxSentences) {
      return sentences.join(' ');
    }

    // Simple extractive summarization - return first few sentences
    return sentences.slice(0, maxSentences).join(' ');
  }

  /**
   * Validate text quality
   */
  validateTextQuality(text) {
    const cleaned = this.clean(text);
    const wordCount = this.getWordCount(cleaned);
    const charCount = this.getCharacterCount(cleaned);

    return {
      isValid: wordCount >= 3 && charCount >= 10,
      wordCount,
      charCount,
      quality: this.calculateQualityScore(cleaned)
    };
  }

  /**
   * Calculate text quality score
   */
  calculateQualityScore(text) {
    const wordCount = this.getWordCount(text);
    const charCount = this.getCharacterCount(text);
    const avgWordLength = charCount / wordCount;

    let score = 0;

    // Word count score (0-40 points)
    if (wordCount >= 10) score += 40;
    else if (wordCount >= 5) score += 20;
    else if (wordCount >= 3) score += 10;

    // Average word length score (0-30 points)
    if (avgWordLength >= 4 && avgWordLength <= 8) score += 30;
    else if (avgWordLength >= 3 && avgWordLength <= 10) score += 20;
    else if (avgWordLength >= 2) score += 10;

    // Character diversity score (0-30 points)
    const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, '')).size;
    const diversity = uniqueChars / charCount;
    if (diversity >= 0.7) score += 30;
    else if (diversity >= 0.5) score += 20;
    else if (diversity >= 0.3) score += 10;

    return Math.min(score, 100);
  }
}

export const textCleaner = new TextCleaner();
