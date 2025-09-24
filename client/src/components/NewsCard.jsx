import { useState } from 'react';
import { 
  ExternalLink, 
  User,
  Clock,
  Share2
} from 'lucide-react';

export default function NewsCard({ item, onSave, onRemove, saved, showSaveButton = true }) {
  const [isBookmarked, setIsBookmarked] = useState(saved || false);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (isBookmarked) {
        await onRemove?.(item.id);
        setIsBookmarked(false);
      } else {
        await onSave?.(item);
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
            {item.categories?.slice(0, 1).map((c) => (
              <span key={c} className="pill">{c}</span>
            ))}
            {showSaveButton && (
              <button onClick={handleSave} disabled={isSaving} className="btn btn--secondary">
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>
        {!expanded && (
          <p className="clamp-3 muted" style={{ margin: 0 }}>{item.description}</p>
        )}
        <div className="meta">
          <span>{item.source}</span>
          {item.author && <span>• {item.author}</span>}
          <span>• {formatTime(item.publishedAt || item.createdAt)}</span>
        </div>
        {expanded && (
          <div className="stack">
            {item.imageUrl && (
              <div className="card__media">
                <img src={item.imageUrl} alt={item.title} className="card__img" />
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


