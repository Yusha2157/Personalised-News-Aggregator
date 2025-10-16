import { http } from './http.js';

export const statsAPI = {
  // Get trending categories
  getTrendingCategories: async (params = {}) => {
    try {
      const { data } = await http.get('/stats/trending/categories', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch trending categories:', error);
      throw error;
    }
  },

  // Get trending tags
  getTrendingTags: async (params = {}) => {
    try {
      const { data } = await http.get('/stats/trending/tags', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch trending tags:', error);
      throw error;
    }
  },

  // Get trending sources
  getTrendingSources: async (params = {}) => {
    try {
      const { data } = await http.get('/stats/trending/sources', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch trending sources:', error);
      throw error;
    }
  },

  // Get top articles
  getTopArticles: async (params = {}) => {
    try {
      const { data } = await http.get('/stats/trending/articles', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch top articles:', error);
      throw error;
    }
  },

  // Get all trending stats
  getAllTrendingStats: async (params = {}) => {
    try {
      const [categories, tags, sources, articles] = await Promise.all([
        statsAPI.getTrendingCategories(params),
        statsAPI.getTrendingTags(params),
        statsAPI.getTrendingSources(params),
        statsAPI.getTopArticles(params)
      ]);

      return {
        categories,
        tags,
        sources,
        articles
      };
    } catch (error) {
      console.error('Failed to fetch trending stats:', error);
      throw error;
    }
  }
};
