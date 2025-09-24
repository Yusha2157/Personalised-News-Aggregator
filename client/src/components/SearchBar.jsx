import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Search className="input-icon" />
        <input
          placeholder="Search news"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input input--with-icon"
        />
      </div>
      <button type="submit" className="btn btn--primary">Search</button>
      <button type="button" onClick={onReset} className="btn btn--secondary">Reset</button>
    </form>
  );
}


