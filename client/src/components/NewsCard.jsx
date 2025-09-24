import { useState } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Calendar, 
  User,
  Clock,
  Share2,
  Newspaper
} from 'lucide-react';

export default function NewsCard({ item, onSave, onRemove, saved, showSaveButton = true }) {
  const [isBookmarked, setIsBookmarked] = useState(saved || false);
  const [isSaving, setIsSaving] = useState(false);

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
    <article className="card group" style={{ padding: 16 }}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Image */}
        {item.imageUrl && (
          <div style={{ width: '100%' }}>
            <div className="card__media">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="card__img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="block group/link"
              >
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  {item.title}
                </h3>
              </a>
            </div>
            
            {/* Save button */}
            {showSaveButton && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Meta information */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Newspaper className="w-3 h-3" />
              <span style={{ fontWeight: 600 }}>{item.source}</span>
            </div>
            {item.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User className="w-3 h-3" />
                <span>{item.author}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock className="w-3 h-3" />
              <span>{formatTime(item.publishedAt || item.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
            {item.description}
          </p>

          {/* Categories */}
          {item.categories && item.categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {item.categories.slice(0, 3).map((category) => {
                const normalized = String(category).toLowerCase();
                const colorMap = {
                  sports: 'badge badge--sports',
                  technology: 'badge badge--technology',
                  tech: 'badge badge--tech',
                  politics: 'badge badge--politics',
                  business: 'badge badge--business',
                  entertainment: 'badge badge--entertainment',
                  health: 'badge badge--health',
                  science: 'badge badge--science',
                  world: 'badge badge--world'
                };
                const fallback = 'badge badge--technology';
                const badgeClass = colorMap[normalized] || fallback;
                return (
                  <span key={category} className={badgeClass}>
                    {category}
                  </span>
                );
              })}
              {item.categories.length > 3 && (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  +{item.categories.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="nav-link"
            >
              Read full article
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <button className="icon-btn">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}


