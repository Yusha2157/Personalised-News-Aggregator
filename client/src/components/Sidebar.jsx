import { useState } from 'react';
import { 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  Newspaper,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Sidebar({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    sources: false,
    dateRange: false,
    tags: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    'Technology', 'Business', 'Health', 'Science', 'Sports', 
    'Entertainment', 'Politics', 'World', 'Local'
  ];

  const sources = [
    'BBC News', 'CNN', 'Reuters', 'The Guardian', 'New York Times',
    'Washington Post', 'Associated Press', 'Bloomberg'
  ];

  const tags = [
    'Breaking', 'Analysis', 'Opinion', 'Interview', 'Review',
    'Investigation', 'Feature', 'Update'
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div className="sidebar__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>
                Filters
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="icon-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="sidebar__content">
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Search Articles
              </label>
              <div style={{ position: 'relative' }}>
                <Search className="input-icon" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ search: e.target.value })}
                  placeholder="Search articles..."
                  className="input input--with-icon"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="fieldset">
              <button
                onClick={() => toggleSection('categories')}
                className="fieldset__legend"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span style={{ fontWeight: 600 }}>
                    Categories
                  </span>
                </div>
                {expandedSections.categories ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.categories && (
                <div className="stack-sm" style={{ marginTop: 8 }}>
                  {categories.map((category) => (
                    <label key={category} className="check">
                      <input
                        type="checkbox"
                        checked={filters.categories?.includes(category) || false}
                        onChange={(e) => {
                          const currentCategories = filters.categories || [];
                          if (e.target.checked) {
                            onFiltersChange({
                              categories: [...currentCategories, category]
                            });
                          } else {
                            onFiltersChange({
                              categories: currentCategories.filter(c => c !== category)
                            });
                          }
                        }}
                        className=""
                      />
                      <span>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sources */}
            <div className="fieldset">
              <button
                onClick={() => toggleSection('sources')}
                className="fieldset__legend"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <span style={{ fontWeight: 600 }}>
                    Sources
                  </span>
                </div>
                {expandedSections.sources ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.sources && (
                <div className="stack-sm" style={{ marginTop: 8 }}>
                  {sources.map((source) => (
                    <label key={source} className="check">
                      <input
                        type="checkbox"
                        checked={filters.sources?.includes(source) || false}
                        onChange={(e) => {
                          const currentSources = filters.sources || [];
                          if (e.target.checked) {
                            onFiltersChange({
                              sources: [...currentSources, source]
                            });
                          } else {
                            onFiltersChange({
                              sources: currentSources.filter(s => s !== source)
                            });
                          }
                        }}
                        className=""
                      />
                      <span>
                        {source}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="fieldset">
              <button
                onClick={() => toggleSection('dateRange')}
                className="fieldset__legend"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span style={{ fontWeight: 600 }}>
                    Date Range
                  </span>
                </div>
                {expandedSections.dateRange ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.dateRange && (
                <div className="stack" style={{ marginTop: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="fieldset">
              <button
                onClick={() => toggleSection('tags')}
                className="fieldset__legend"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span style={{ fontWeight: 600 }}>
                    Tags
                  </span>
                </div>
                {expandedSections.tags ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {expandedSections.tags && (
                <div className="stack-sm" style={{ marginTop: 8 }}>
                  {tags.map((tag) => (
                    <label key={tag} className="check">
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={(e) => {
                          const currentTags = filters.tags || [];
                          if (e.target.checked) {
                            onFiltersChange({
                              tags: [...currentTags, tag]
                            });
                          } else {
                            onFiltersChange({
                              tags: currentTags.filter(t => t !== tag)
                            });
                          }
                        }}
                        className=""
                      />
                      <span>
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sidebar__footer">
            <button
              onClick={() => onFiltersChange({
                search: '',
                categories: [],
                sources: [],
                dateFrom: '',
                dateTo: '',
                tags: []
              })}
              className="btn btn--secondary" style={{ width: '100%' }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
