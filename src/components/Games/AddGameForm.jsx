import { useState } from 'react';

export default function AddGameForm({ onAddGame, onAddBulkGames, showError, showSuccess }) {
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(false);

  // Single game form state
  const [name, setName] = useState('');
  const [players, setPlayers] = useState('');
  const [playTime, setPlayTime] = useState('');
  const [description, setDescription] = useState('');

  // Bulk form state
  const [bulkText, setBulkText] = useState('');
  const [separator, setSeparator] = useState('tab');

  const handleAddSingle = async (e) => {
    e?.preventDefault();

    if (!name.trim()) {
      showError('Please enter a game name');
      return;
    }

    try {
      setLoading(true);
      await onAddGame({
        name: name.trim(),
        players: players.trim(),
        playTime: playTime.trim(),
        description: description.trim()
      });
      setName('');
      setPlayers('');
      setPlayTime('');
      setDescription('');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulk = async () => {
    if (!bulkText.trim()) {
      showError('Please paste at least one game');
      return;
    }

    try {
      setLoading(true);

      const games = [];
      const lines = bulkText.split('\n').filter((line) => line.trim().length > 0);
      const sep = separator === 'tab' ? '\t' : ',';

      for (const line of lines) {
        const fields = line.split(sep).map((field) => field.trim());

        if (fields.length === 0 || !fields[0]) continue;

        games.push({
          name: fields[0],
          players: fields.length > 2 ? fields[2] : '',
          playTime: fields.length > 3 ? fields[3] : '',
          description: fields.length > 4 ? fields[4] : ''
        });
      }

      if (games.length === 0) {
        showError('No valid games found');
        return;
      }

      const count = await onAddBulkGames(games);
      showSuccess(`Added ${count} game(s)`);
      setBulkText('');
      setShowBulk(false);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      handleAddSingle(e);
    }
  };

  if (showBulk) {
    return (
      <div className="add-game-section">
        <h3>Add Multiple Games</h3>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
          Format: Title, Owner, Players, Play Time, Description
        </label>
        <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#666' }}>
          One game per line. Owner field is ignored. Other fields are optional.
        </label>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="Catan, John, 2-4, 60 mins, A strategy game about building settlements&#10;Ticket to Ride, Jane, 2-5, 45-90 mins, Railway adventure game"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'monospace',
            minHeight: '120px',
            resize: 'vertical'
          }}
        />
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Field Separator:
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
              <input
                type="radio"
                name="separator"
                checked={separator === 'comma'}
                onChange={() => setSeparator('comma')}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              Comma-separated
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
              <input
                type="radio"
                name="separator"
                checked={separator === 'tab'}
                onChange={() => setSeparator('tab')}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              Tab-separated
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-primary btn-small"
            onClick={handleAddBulk}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Adding...' : 'Add Games'}
          </button>
          <button
            className="btn-primary btn-small"
            onClick={() => {
              setShowBulk(false);
              setBulkText('');
            }}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-game-section">
      <h3>Add a New Game</h3>
      <form onSubmit={handleAddSingle}>
        <div className="game-input-group">
          <input
            type="text"
            placeholder="Enter board game name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-primary btn-small" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Number of Players
            </label>
            <input
              type="text"
              placeholder="e.g., 2-4 or 1-6"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Play Time
            </label>
            <input
              type="text"
              placeholder="e.g., 30-60 mins"
              value={playTime}
              onChange={(e) => setPlayTime(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Description
          </label>
          <textarea
            placeholder="Brief description of the game..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            className="btn-primary btn-small"
            onClick={() => setShowBulk(true)}
            style={{ width: '100%' }}
          >
            Paste Multiple Games
          </button>
        </div>
      </form>
    </div>
  );
}
