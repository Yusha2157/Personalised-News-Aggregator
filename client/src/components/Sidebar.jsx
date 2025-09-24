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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filters
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Articles
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ search: e.target.value })}
                  placeholder="Search articles..."
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
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
                <div className="mt-3 space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sources */}
            <div>
              <button
                onClick={() => toggleSection('sources')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
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
                <div className="mt-3 space-y-2">
                  {sources.map((source) => (
                    <label key={source} className="flex items-center space-x-2">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {source}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div>
              <button
                onClick={() => toggleSection('dateRange')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
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
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <button
                onClick={() => toggleSection('tags')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
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
                <div className="mt-3 space-y-2">
                  {tags.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onFiltersChange({
                search: '',
                categories: [],
                sources: [],
                dateFrom: '',
                dateTo: '',
                tags: []
              })}
              className="w-full btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
