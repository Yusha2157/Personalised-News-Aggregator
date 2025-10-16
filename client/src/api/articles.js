import { http } from './http.js';

export const articlesAPI = {
  // Get articles with filtering and pagination
  getArticles: async (params = {}) => {
    try {
      const { data } = await http.get('/articles', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      throw error;
    }
  },

  // Get single article by ID
  getArticle: async (id) => {
    try {
      const { data } = await http.get(`/articles/${id}`);
      return data;
    } catch (error) {
      console.error(`Failed to fetch article ${id}:`, error);
      throw error;
    }
  },

  // Get trending articles
  getTrendingArticles: async (params = {}) => {
    try {
      const { data } = await http.get('/articles/trending', { params });
      return data;
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
      throw error;
    }
  },

  // Trigger news fetch (admin only)
  fetchNews: async (params = {}) => {
    try {
      const { data } = await http.post('/articles/fetch', params);
      return data;
    } catch (error) {
      console.error('Failed to fetch news:', error);
      throw error;
    }
  },

  // Search articles
  searchArticles: async (query, params = {}) => {
    try {
      const { data } = await http.get('/articles', { 
        params: { ...params, search: query } 
      });
      return data;
    } catch (error) {
      console.error('Failed to search articles:', error);
      throw error;
    }
  },

  // Get articles by category
  getArticlesByCategory: async (category, params = {}) => {
    try {
      const { data } = await http.get('/articles', { 
        params: { ...params, category } 
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${category} articles:`, error);
      throw error;
    }
  },

  // Get articles by tags
  getArticlesByTags: async (tags, params = {}) => {
    try {
      const tagString = Array.isArray(tags) ? tags.join(',') : tags;
      const { data } = await http.get('/articles', { 
        params: { ...params, tags: tagString } 
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch articles by tags:', error);
      throw error;
    }
  }
};
