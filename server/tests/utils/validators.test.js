/**
 * Validators Utility Tests
 * Unit tests for input validation schemas
 */

import { validators } from '../../src/utils/validators.js';

describe('Validators Utility', () => {
  describe('authSchemas', () => {
    describe('register', () => {
      it('should validate valid registration data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
          name: 'John Doe'
        };

        const { error } = validators.authSchemas.register.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
          name: 'John Doe'
        };

        const { error } = validators.authSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('email');
      });

      it('should reject weak password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '123',
          name: 'John Doe'
        };

        const { error } = validators.authSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].path).toContain('password');
      });

      it('should reject missing required fields', () => {
        const invalidData = {
          email: 'test@example.com'
          // Missing password and name
        };

        const { error } = validators.authSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details.length).toBeGreaterThan(1);
      });
    });

    describe('login', () => {
      it('should validate valid login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const { error } = validators.authSchemas.login.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid email format', () => {
        const invalidData = {
          email: 'not-an-email',
          password: 'password123'
        };

        const { error } = validators.authSchemas.login.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject missing password', () => {
        const invalidData = {
          email: 'test@example.com'
        };

        const { error } = validators.authSchemas.login.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('changePassword', () => {
      it('should validate valid password change data', () => {
        const validData = {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123'
        };

        const { error } = validators.authSchemas.changePassword.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject weak new password', () => {
        const invalidData = {
          currentPassword: 'oldpassword123',
          newPassword: '123'
        };

        const { error } = validators.authSchemas.changePassword.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject missing fields', () => {
        const invalidData = {
          currentPassword: 'oldpassword123'
        };

        const { error } = validators.authSchemas.changePassword.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('forgotPassword', () => {
      it('should validate valid email', () => {
        const validData = {
          email: 'test@example.com'
        };

        const { error } = validators.authSchemas.forgotPassword.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid email', () => {
        const invalidData = {
          email: 'not-an-email'
        };

        const { error } = validators.authSchemas.forgotPassword.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('resetPassword', () => {
      it('should validate valid reset data', () => {
        const validData = {
          token: 'valid-reset-token',
          newPassword: 'newpassword123'
        };

        const { error } = validators.authSchemas.resetPassword.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject missing token', () => {
        const invalidData = {
          newPassword: 'newpassword123'
        };

        const { error } = validators.authSchemas.resetPassword.validate(invalidData);
        expect(error).toBeDefined();
      });
    });
  });

  describe('articleSchemas', () => {
    describe('fetchNews', () => {
      it('should validate valid fetch parameters', () => {
        const validData = {
          categories: ['technology', 'science'],
          sources: ['techcrunch', 'wired'],
          pageSize: 50
        };

        const { error } = validators.articleSchemas.fetchNews.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should validate with minimal parameters', () => {
        const validData = {};

        const { error } = validators.articleSchemas.fetchNews.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid categories', () => {
        const invalidData = {
          categories: ['invalid-category']
        };

        const { error } = validators.articleSchemas.fetchNews.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject invalid pageSize', () => {
        const invalidData = {
          pageSize: 200 // Too large
        };

        const { error } = validators.articleSchemas.fetchNews.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('listArticles', () => {
      it('should validate valid list parameters', () => {
        const validData = {
          page: 1,
          limit: 20,
          sortBy: 'publishedAt',
          sortOrder: 'desc',
          category: 'technology',
          tags: ['ai', 'machine-learning'],
          search: 'artificial intelligence',
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        };

        const { error } = validators.articleSchemas.listArticles.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should validate with minimal parameters', () => {
        const validData = {};

        const { error } = validators.articleSchemas.listArticles.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid sortBy', () => {
        const invalidData = {
          sortBy: 'invalid-field'
        };

        const { error } = validators.articleSchemas.listArticles.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject invalid sortOrder', () => {
        const invalidData = {
          sortOrder: 'invalid-order'
        };

        const { error } = validators.articleSchemas.listArticles.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject invalid date format', () => {
        const invalidData = {
          dateFrom: 'invalid-date'
        };

        const { error } = validators.articleSchemas.listArticles.validate(invalidData);
        expect(error).toBeDefined();
      });
    });
  });

  describe('userSchemas', () => {
    describe('updateProfile', () => {
      it('should validate valid profile data', () => {
        const validData = {
          name: 'John Doe',
          avatarUrl: 'https://example.com/avatar.jpg',
          preferences: {
            categories: ['technology', 'science'],
            sources: ['techcrunch'],
            language: 'en'
          }
        };

        const { error } = validators.userSchemas.updateProfile.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should validate with minimal data', () => {
        const validData = {
          name: 'John Doe'
        };

        const { error } = validators.userSchemas.updateProfile.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid avatar URL', () => {
        const invalidData = {
          name: 'John Doe',
          avatarUrl: 'not-a-url'
        };

        const { error } = validators.userSchemas.updateProfile.validate(invalidData);
        expect(error).toBeDefined();
      });

      it('should reject invalid preferences', () => {
        const invalidData = {
          name: 'John Doe',
          preferences: {
            language: 'invalid-language'
          }
        };

        const { error } = validators.userSchemas.updateProfile.validate(invalidData);
        expect(error).toBeDefined();
      });
    });

    describe('updateInterests', () => {
      it('should validate valid interests', () => {
        const validData = {
          categories: ['technology', 'science'],
          tags: ['ai', 'machine-learning'],
          sources: ['techcrunch', 'wired']
        };

        const { error } = validators.userSchemas.updateInterests.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should validate empty arrays', () => {
        const validData = {
          categories: [],
          tags: [],
          sources: []
        };

        const { error } = validators.userSchemas.updateInterests.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid categories', () => {
        const invalidData = {
          categories: ['invalid-category']
        };

        const { error } = validators.userSchemas.updateInterests.validate(invalidData);
        expect(error).toBeDefined();
      });
    });
  });

  describe('adminSchemas', () => {
    describe('triggerJob', () => {
      it('should validate valid job data', () => {
        const validData = {
          jobType: 'fetch',
          params: { categories: ['technology'] }
        };

        const { error } = validators.adminSchemas.triggerJob.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid job type', () => {
        const invalidData = {
          jobType: 'invalid-job'
        };

        const { error } = validators.adminSchemas.triggerJob.validate(invalidData);
        expect(error).toBeDefined();
      });
    });
  });

  describe('validate', () => {
    it('should validate data against schema', () => {
      const schema = validators.authSchemas.register;
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      };

      const result = validators.validate(schema, data);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
    });

    it('should return validation error for invalid data', () => {
      const schema = validators.authSchemas.register;
      const data = {
        email: 'invalid-email'
      };

      const result = validators.validate(schema, data);
      expect(result.isValid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('sanitize', () => {
    it('should sanitize HTML content', () => {
      const htmlContent = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = validators.sanitize(htmlContent);
      expect(sanitized).toBe('Safe content');
    });

    it('should handle null and undefined', () => {
      expect(validators.sanitize(null)).toBe('');
      expect(validators.sanitize(undefined)).toBe('');
    });

    it('should preserve safe content', () => {
      const safeContent = 'This is safe text content';
      const sanitized = validators.sanitize(safeContent);
      expect(sanitized).toBe(safeContent);
    });
  });
});
