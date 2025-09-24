export default function SearchBar({ value, onChange, onSubmit, onReset }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Search news"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit">Search</button>
      <button type="button" onClick={onReset}>Reset</button>
    </form>
  );
}


