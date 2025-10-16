/**
 * Text Cleaner Utility Tests
 * Unit tests for text processing functionality
 */

import { textCleaner } from '../../src/utils/textCleaner.js';

describe('Text Cleaner Utility', () => {
  describe('clean', () => {
    it('should clean HTML tags from text', () => {
      const htmlText = '<p>This is <b>bold</b> text with <a href="#">links</a></p>';
      const cleaned = textCleaner.clean(htmlText);
      expect(cleaned).toBe('This is bold text with links');
    });

    it('should decode HTML entities', () => {
      const entityText = 'This &amp; that &lt;tag&gt; &quot;quoted&quot;';
      const cleaned = textCleaner.clean(entityText);
      expect(cleaned).toBe('This & that <tag> "quoted"');
    });

    it('should normalize whitespace', () => {
      const messyText = 'This   has\n\n\nmultiple   spaces\nand\t\ttabs';
      const cleaned = textCleaner.clean(messyText);
      expect(cleaned).toBe('This has multiple spaces and tabs');
    });

    it('should handle empty or null input', () => {
      expect(textCleaner.clean('')).toBe('');
      expect(textCleaner.clean(null)).toBe('');
      expect(textCleaner.clean(undefined)).toBe('');
    });
  });

  describe('extractWords', () => {
    it('should extract words from text', () => {
      const text = 'This is a test sentence.';
      const words = textCleaner.extractWords(text);
      expect(words).toEqual(['This', 'is', 'a', 'test', 'sentence']);
    });

    it('should handle punctuation', () => {
      const text = 'Hello, world! How are you?';
      const words = textCleaner.extractWords(text);
      expect(words).toEqual(['Hello', 'world', 'How', 'are', 'you']);
    });
  });

  describe('getWordCount', () => {
    it('should count words correctly', () => {
      const text = 'This is a test sentence with seven words';
      const count = textCleaner.getWordCount(text);
      expect(count).toBe(8);
    });

    it('should handle empty text', () => {
      const count = textCleaner.getWordCount('');
      expect(count).toBe(0);
    });
  });

  describe('getReadingTime', () => {
    it('should calculate reading time', () => {
      const text = 'This is a test sentence with some words for reading time calculation';
      const readingTime = textCleaner.getReadingTime(text);
      expect(readingTime).toBeGreaterThan(0);
    });

    it('should use custom words per minute', () => {
      const text = 'This is a test';
      const readingTime = textCleaner.getReadingTime(text, 100); // 100 words per minute
      expect(readingTime).toBe(1); // Should round up to 1 minute
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'This is a test about artificial intelligence and machine learning technologies';
      const keywords = textCleaner.extractKeywords(text, 3);
      expect(keywords).toHaveLength(3);
      expect(keywords).toContain('artificial');
      expect(keywords).toContain('intelligence');
    });

    it('should filter out stop words', () => {
      const text = 'the and or but this that is are was were';
      const keywords = textCleaner.extractKeywords(text);
      expect(keywords).toHaveLength(0);
    });
  });

  describe('normalize', () => {
    it('should normalize text for comparison', () => {
      const text = 'This is a Test with PUNCTUATION!';
      const normalized = textCleaner.normalize(text);
      expect(normalized).toBe('this is a test with punctuation');
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between texts', () => {
      const text1 = 'artificial intelligence machine learning';
      const text2 = 'machine learning artificial intelligence';
      const similarity = textCleaner.calculateSimilarity(text1, text2);
      expect(similarity).toBe(1.0); // Should be identical
    });

    it('should calculate partial similarity', () => {
      const text1 = 'artificial intelligence machine learning';
      const text2 = 'artificial intelligence deep learning';
      const similarity = textCleaner.calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should handle no common words', () => {
      const text1 = 'completely different text';
      const text2 = 'totally unrelated content';
      const similarity = textCleaner.calculateSimilarity(text1, text2);
      expect(similarity).toBe(0);
    });
  });

  describe('truncate', () => {
    it('should truncate text at word boundary', () => {
      const text = 'This is a long text that should be truncated at word boundary';
      const truncated = textCleaner.truncate(text, 20);
      expect(truncated).toContain('...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const truncated = textCleaner.truncate(text, 20);
      expect(truncated).toBe(text);
    });
  });

  describe('validateTextQuality', () => {
    it('should validate good quality text', () => {
      const text = 'This is a well-written article with good content and proper structure';
      const validation = textCleaner.validateTextQuality(text);
      expect(validation.isValid).toBe(true);
      expect(validation.quality).toBeGreaterThan(50);
    });

    it('should reject poor quality text', () => {
      const text = 'a';
      const validation = textCleaner.validateTextQuality(text);
      expect(validation.isValid).toBe(false);
    });
  });
});
