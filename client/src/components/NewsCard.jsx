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
    <article className="card group hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Image */}
        {item.imageUrl && (
          <div className="lg:w-64 lg:flex-shrink-0">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-48 lg:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
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
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              <span className="font-medium">{item.source}</span>
            </div>
            {item.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{item.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(item.publishedAt || item.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
            {item.description}
          </p>

          {/* Categories */}
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.categories.slice(0, 3).map((category) => (
                <span key={category} className="badge-category">
                  {category}
                </span>
              ))}
              {item.categories.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{item.categories.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Read full article
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}


