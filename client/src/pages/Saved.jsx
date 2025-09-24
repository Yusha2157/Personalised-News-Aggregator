import { useEffect, useState } from 'react';
import { http } from '../api/http.js';
import NewsCard from '../components/NewsCard.jsx';
import { 
  Bookmark, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function Saved() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await http.get('/news/saved');
      setItems(data.savedArticles || []);
    } catch (e) {
      setError('Failed to load saved articles');
      console.error('Error loading saved articles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const remove = async (id) => {
    try {
      await http.delete(`/news/saved/${encodeURIComponent(id)}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error('Error removing article:', e);
    }
  };

  const handleRefresh = () => {
    load();
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading saved articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error loading articles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-blue-600" />
            Saved Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {items.length} {items.length === 1 ? 'article' : 'articles'} saved
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search saved articles..."
          className="input pl-10"
        />
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No saved articles yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start saving articles from your feed to see them here
          </p>
          <a
            href="/"
            className="btn-primary"
          >
            Browse Articles
          </a>
        </div>
      )}

      {/* No Search Results */}
      {items.length > 0 && filteredItems.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms
          </p>
        </div>
      )}

      {/* Articles List */}
      {filteredItems.length > 0 && (
        <div className="space-y-6">
          {filteredItems.map((article) => (
            <div key={article.id} className="relative group">
              <NewsCard 
                item={article} 
                onRemove={remove} 
                saved={true}
                showSaveButton={false}
              />
              
              {/* Remove Button */}
              <button
                onClick={() => remove(article.id)}
                className="absolute top-4 right-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200 dark:hover:bg-red-900/40"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {items.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Saved
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(items.map(item => item.source)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sources
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(items.flatMap(item => item.categories || [])).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


