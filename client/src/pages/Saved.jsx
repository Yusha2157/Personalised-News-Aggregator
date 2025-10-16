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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
          <span className="muted">Loading saved articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle className="w-12 h-12" style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--fg)' }}>
            Error loading articles
          </h3>
          <p className="muted" style={{ marginBottom: 16 }}>{error}</p>
          <button onClick={handleRefresh} className="btn btn--primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            Saved Articles
          </h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {items.length} {items.length === 1 ? 'article' : 'articles'} saved
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn btn--secondary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div className="searchbar" style={{ position: 'relative', maxWidth: 600 }}>
          <Search className="input-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved articles..."
            className="input input--with-icon"
          />
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ width: 64, height: 64, background: 'var(--border)', borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
            <Bookmark className="w-8 h-8" style={{ color: 'var(--muted)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No saved articles yet
          </h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Start saving articles from your feed to see them here
          </p>
          <a href="/" className="btn btn--primary">
            Browse Articles
          </a>
        </div>
      )}

      {/* No Search Results */}
      {items.length > 0 && filteredItems.length === 0 && searchTerm && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ width: 64, height: 64, background: 'var(--border)', borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
            <Search className="w-8 h-8" style={{ color: 'var(--muted)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No articles found
          </h3>
          <p className="muted">
            Try adjusting your search terms
          </p>
        </div>
      )}

      {/* Articles Grid */}
      {filteredItems.length > 0 && (
        <div className="grid-articles">
          {filteredItems.map((article) => (
            <div key={article.id} className="card">
              <div className="card__media">
                <img 
                  src={article.urlToImage || '/placeholder-image.jpg'} 
                  alt={article.title}
                  className="card__img"
                />
              </div>
              <div style={{ padding: '1rem' }}>
                <a href={article.url} target="_blank" rel="noreferrer" className="headline">
                  {article.title}
                </a>
                <p className="clamp-3" style={{ margin: '0.5rem 0' }}>
                  {article.description}
                </p>
                <div className="meta" style={{ marginTop: '0.75rem' }}>
                  <span>{article.source}</span>
                  {article.author && <span>• {article.author}</span>}
                  <span>• {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <span className="pill" style={{ textTransform: 'capitalize' }}>
                    {article.category || 'general'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => remove(article.id)} 
                    className="btn btn--secondary" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div style={{ marginTop: 32, padding: '1rem', background: 'var(--border)', borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {items.length}
              </div>
              <div className="muted">
                Total Saved
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {new Set(items.map(item => item.source)).size}
              </div>
              <div className="muted">
                Sources
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)' }}>
                {new Set(items.flatMap(item => item.categories || [])).size}
              </div>
              <div className="muted">
                Categories
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


