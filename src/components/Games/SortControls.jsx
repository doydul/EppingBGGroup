export default function SortControls({ sortType, onSortChange }) {
  return (
    <div className="sort-controls">
      <label>Sort by:</label>
      <select value={sortType} onChange={(e) => onSortChange(e.target.value)}>
        <option value="alphabetical">Alphabetical</option>
        <option value="wantToPlay">Desire to play</option>
      </select>
    </div>
  );
}
