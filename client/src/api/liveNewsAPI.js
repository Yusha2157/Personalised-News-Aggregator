/**
 * Live News API Service
 * Handles communication with the live news endpoints
 */

import { http } from './http.js';

export const liveNewsAPI = {
  /**
   * Get live news from all sources
   * @param {Object} params - Query parameters
   * @param {string} params.category - News category
   * @param {string} params.query - Search query
   * @param {number} params.limit - Maximum number of articles
   * @param {boolean} params.useCache - Whether to use cached results
   * @returns {Promise<Object>} Live news data
   */
  async getLiveNews(params = {}) {
    try {
      const response = await http.get('/live-news', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch live news:', error);
      throw error;
    }
  },

  /**
   * Get live news by category
   * @param {string} category - News category
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Live news data
   */
  async getLiveNewsByCategory(category, params = {}) {
    try {
      const response = await http.get(`/live-news/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${category} news:`, error);
      throw error;
    }
  },

  /**
   * Search live news
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Search results
   */
  async searchLiveNews(query, params = {}) {
    try {
      const response = await http.get('/live-news/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search live news:', error);
      throw error;
    }
  },

  /**
   * Get available news sources
   * @returns {Promise<Object>} Available sources
   */
  async getAvailableSources() {
    try {
      const response = await http.get('/live-news/sources');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available sources:', error);
      throw error;
    }
  },

  /**
   * Health check for all news services
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await http.get('/live-news/health');
      return response.data;
    } catch (error) {
      console.error('Failed to check health:', error);
      throw error;
    }
  }
};
