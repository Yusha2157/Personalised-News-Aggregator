const CATEGORIES = ['all', 'technology', 'sports', 'business', 'entertainment', 'science', 'health', 'politics'];

export default function CategoryTabs({ value, onChange, counts = {} }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div className="tabs">
        {CATEGORIES.map((c) => {
          const isActive = value === c;
          return (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={`tab ${isActive ? 'tab--active' : ''}`}
            >
              <span style={{ textTransform: 'capitalize' }}>{c}</span>
              {counts[c] !== undefined && (
                <span className="tab__count">({counts[c]})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


