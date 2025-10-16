/**
 * Paginator Utility Tests
 * Unit tests for pagination functionality
 */

import { paginator } from '../../src/utils/paginator.js';

describe('Paginator Utility', () => {
  describe('paginate', () => {
    let mockQuery;

    beforeEach(() => {
      // Mock Mongoose query with chainable methods
      mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(100),
        exec: jest.fn().mockResolvedValue([])
      };
    });

    it('should paginate with default parameters', async () => {
      const result = await paginator.paginate(mockQuery, {});
      
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(mockQuery.countDocuments).toHaveBeenCalled();
      expect(mockQuery.exec).toHaveBeenCalled();

      expect(result).toHaveProperty('data', []);
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('limit', 20);
      expect(result.pagination).toHaveProperty('total', 100);
      expect(result.pagination).toHaveProperty('pages', 5);
    });

    it('should paginate with custom parameters', async () => {
      const options = {
        page: 3,
        limit: 10,
        sort: { title: 1 }
      };

      const result = await paginator.paginate(mockQuery, options);
      
      expect(mockQuery.sort).toHaveBeenCalledWith({ title: 1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(20); // (page - 1) * limit
      expect(mockQuery.limit).toHaveBeenCalledWith(10);

      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.pages).toBe(10);
    });

    it('should handle edge cases', async () => {
      // Test with zero results
      mockQuery.countDocuments.mockResolvedValue(0);
      mockQuery.exec.mockResolvedValue([]);

      const result = await paginator.paginate(mockQuery, { page: 1, limit: 20 });
      
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.pages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should handle large page numbers', async () => {
      const result = await paginator.paginate(mockQuery, { page: 100, limit: 20 });
      
      expect(result.pagination.page).toBe(100);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should handle invalid page numbers', async () => {
      const result = await paginator.paginate(mockQuery, { page: -1, limit: 20 });
      
      expect(result.pagination.page).toBe(1);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should handle invalid limit values', async () => {
      const result = await paginator.paginate(mockQuery, { page: 1, limit: -5 });
      
      expect(result.pagination.limit).toBe(20); // Default limit
    });

    it('should handle very large limits', async () => {
      const result = await paginator.paginate(mockQuery, { page: 1, limit: 1000 });
      
      expect(result.pagination.limit).toBe(100); // Max limit
    });
  });

  describe('buildPaginationMeta', () => {
    it('should build pagination metadata correctly', () => {
      const meta = paginator.buildPaginationMeta(1, 20, 100);
      
      expect(meta).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        pages: 5,
        hasNext: true,
        hasPrev: false,
        nextPage: 2,
        prevPage: null
      });
    });

    it('should handle last page', () => {
      const meta = paginator.buildPaginationMeta(5, 20, 100);
      
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
      expect(meta.nextPage).toBe(null);
      expect(meta.prevPage).toBe(4);
    });

    it('should handle single page', () => {
      const meta = paginator.buildPaginationMeta(1, 20, 15);
      
      expect(meta.pages).toBe(1);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });

    it('should handle zero total', () => {
      const meta = paginator.buildPaginationMeta(1, 20, 0);
      
      expect(meta.total).toBe(0);
      expect(meta.pages).toBe(0);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });
  });

  describe('validatePaginationParams', () => {
    it('should validate and normalize valid parameters', () => {
      const params = { page: '2', limit: '10' };
      const validated = paginator.validatePaginationParams(params);
      
      expect(validated.page).toBe(2);
      expect(validated.limit).toBe(10);
    });

    it('should handle missing parameters', () => {
      const params = {};
      const validated = paginator.validatePaginationParams(params);
      
      expect(validated.page).toBe(1);
      expect(validated.limit).toBe(20);
    });

    it('should handle invalid string parameters', () => {
      const params = { page: 'invalid', limit: 'also-invalid' };
      const validated = paginator.validatePaginationParams(params);
      
      expect(validated.page).toBe(1);
      expect(validated.limit).toBe(20);
    });

    it('should enforce maximum limit', () => {
      const params = { page: 1, limit: 1000 };
      const validated = paginator.validatePaginationParams(params);
      
      expect(validated.limit).toBe(100);
    });

    it('should enforce minimum values', () => {
      const params = { page: -5, limit: 0 };
      const validated = paginator.validatePaginationParams(params);
      
      expect(validated.page).toBe(1);
      expect(validated.limit).toBe(20);
    });
  });

  describe('getOffset', () => {
    it('should calculate offset correctly', () => {
      expect(paginator.getOffset(1, 20)).toBe(0);
      expect(paginator.getOffset(2, 20)).toBe(20);
      expect(paginator.getOffset(3, 10)).toBe(20);
    });

    it('should handle edge cases', () => {
      expect(paginator.getOffset(0, 20)).toBe(0);
      expect(paginator.getOffset(-1, 20)).toBe(0);
    });
  });

  describe('getTotalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(paginator.getTotalPages(100, 20)).toBe(5);
      expect(paginator.getTotalPages(101, 20)).toBe(6);
      expect(paginator.getTotalPages(0, 20)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(paginator.getTotalPages(1, 20)).toBe(1);
      expect(paginator.getTotalPages(20, 20)).toBe(1);
    });
  });
});
