import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import NewsCard from '../components/NewsCard.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
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
  const [loading, setLoading] = useState(false);
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
    if (loading && !reset) return;
    
    setLoading(true);
    setError('');
    
    try {
      const currentPage = reset ? 1 : page;
      // Minimal server supports: GET /news/feed (uses user interests) and GET /news/search?q=&categories=
      const hasSearch = (filters.search || '').trim().length > 0;
      const hasCategories = (filters.categories || []).length > 0;
      const endpoint = hasSearch || hasCategories ? '/news/search' : '/news/feed';
      const params = hasSearch || hasCategories
        ? {
            q: filters.search || '',
            categories: (filters.categories || []).join(','),
          }
        : {};

      const { data } = await http.get(endpoint, { params });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, JSON.stringify(filters.categories), filters.sources?.length, filters.dateFrom, filters.dateTo, JSON.stringify(filters.tags)]);

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCategoryChange = (category) => {
    if (category === 'all') {
      setFilters(prev => ({ ...prev, categories: [] }));
    } else {
      setFilters(prev => ({ ...prev, categories: [category] }));
    }
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
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar */}
      <Sidebar 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>
              News Feed
            </h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Stay updated with the latest news
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn--secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="btn btn--secondary"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters + Search */}
        <div style={{ marginBottom: 24 }}>
          <div className="stack">
            <CategoryTabs
              value={(filters.categories[0] || 'all')}
              onChange={handleCategoryChange}
            />
            <div className="searchbar" style={{ position: 'relative' }}>
            <Search className="input-icon" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              placeholder="Search articles..."
              className="input input--with-icon"
            />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, marginBottom: 24, borderColor: 'var(--danger-100)' }}>
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span style={{ color: '#b91c1c' }}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="muted">Loading articles...</span>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: 64, height: 64, background: 'var(--border)', borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              No articles found
            </h3>
            <p className="muted">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 && (
          <div className="grid-articles">
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
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="btn btn--primary"
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
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p className="muted">
              You've reached the end of the articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


