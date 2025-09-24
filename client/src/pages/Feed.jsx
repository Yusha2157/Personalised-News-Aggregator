import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import NewsCard from '../components/NewsCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { 
  Filter, 
  Search, 
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function Feed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    sources: [],
    dateFrom: '',
    dateTo: '',
    tags: []
  });

  const loadArticles = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 12,
        ...filters
      };

      const { data } = await http.get('/news/feed', { params });
      const newArticles = data.articles || [];
      
      if (reset) {
        setArticles(newArticles);
        setPage(2);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(newArticles.length === 12);
    } catch (e) {
      setError('Failed to load articles');
      console.error('Error loading articles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(true);
  }, [filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleLoadMore = () => {
    loadArticles(false);
  };

  const handleRefresh = () => {
    loadArticles(true);
  };

  const save = async (item) => {
    try {
      await http.post('/news/save', item);
      // You could add a toast notification here
    } catch (e) {
      console.error('Error saving article:', e);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <Sidebar 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              News Feed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with the latest news
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              placeholder="Search articles..."
              className="input pl-10"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Loading articles...</span>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div className="space-y-6">
            {articles.map((article) => (
              <NewsCard 
                key={article.id} 
                item={article} 
                onSave={save}
                showSaveButton={true}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {articles.length > 0 && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Articles'
              )}
            </button>
          </div>
        )}

        {/* End of Results */}
        {articles.length > 0 && !hasMore && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You've reached the end of the articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


