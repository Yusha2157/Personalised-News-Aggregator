const CATEGORIES = ['all', 'technology', 'sports', 'business', 'entertainment', 'science', 'health', 'politics'];

export default function CategoryTabs({ value, onChange, counts = {} }) {
  return (
    <div className="tabs">
      {CATEGORIES.map((c) => (
        <button key={c} onClick={() => onChange(c)} className={`tab${value === c ? ' active' : ''}`}>
          <span style={{ textTransform: 'capitalize' }}>{c}</span>
          {counts[c] !== undefined ? <span style={{ marginLeft: 6, opacity: 0.9 }}>({counts[c]})</span> : null}
        </button>
      ))}
    </div>
  );
}


