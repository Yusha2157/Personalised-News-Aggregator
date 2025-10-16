import { useState } from 'react';
import { 
  ExternalLink, 
  User,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

export default function NewsCard({ item, onSave, onUnsave, saved, showSaveButton = true }) {
  const [isBookmarked, setIsBookmarked] = useState(saved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (isBookmarked) {
        await onUnsave?.(item._id);
        setIsBookmarked(false);
      } else {
        await onSave?.(item._id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return formatDate(dateString);
  };

  return (
    <article className="card card--compact">
      <div className="stack">
        <div className="row-between">
          <a href={item.url} target="_blank" rel="noreferrer" className="headline">
            {item.title}
          </a>
          <div className="row">
            {item.category && (
              <span className="pill">{item.category}</span>
            )}
            {showSaveButton && (
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className={`btn btn--secondary ${isBookmarked ? 'saved' : ''}`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {!expanded && (
          <p className="clamp-3 muted" style={{ margin: 0 }}>{item.description}</p>
        )}
        <div className="meta">
          <span>{item.source?.name || item.source}</span>
          {item.author && <span>• {item.author}</span>}
          <span>• {formatTime(item.publishedAt || item.createdAt)}</span>
        </div>
        {expanded && (
          <div className="stack">
            {item.urlToImage && (
              <div className="card__media">
                <img src={item.urlToImage} alt={item.title} className="card__img" />
              </div>
            )}
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {item.tags.slice(0, 5).map((tag) => (
                  <span key={tag} style={{ fontSize: '12px', background: 'var(--border)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="row-between">
              <a href={item.url} target="_blank" rel="noreferrer" className="nav-link">Read full article <ExternalLink className="w-3 h-3" /></a>
              <button className="icon-btn"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>
        )}
        <button onClick={() => setExpanded((v) => !v)} className="nav-link" style={{ alignSelf: 'flex-start' }}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
    </article>
  );
}


