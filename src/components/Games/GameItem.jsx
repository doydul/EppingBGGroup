import { useState, useEffect } from 'react';

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getColorClass(preferenceValue) {
  if (preferenceValue === 5) return 'user-badge-red';
  if (preferenceValue === 4) return 'user-badge-orange';
  if (preferenceValue === 3) return 'user-badge-yellow';
  return 'user-badge';
}

export default function GameItem({
  game,
  isMyGame,
  currentUserId,
  onDelete,
  onPreferenceChange,
  onToggleKnowHow,
  getUserPreference,
  getWantToPlayUsers,
  getKnowHowToPlayUsers
}) {
  const [preference, setPreference] = useState(0);
  const [wantToPlayUsers, setWantToPlayUsers] = useState([]);
  const [knowHowUsers, setKnowHowUsers] = useState([]);

  const gameIds = game.gameIds || [game.id];
  const isOwnedByCurrentUser = game.owners
    ? game.owners.some((o) => o.userId === currentUserId)
    : game.userId === currentUserId;

  useEffect(() => {
    const loadData = async () => {
      const pref = await getUserPreference(game.id);
      setPreference(pref);

      const wtpUsers = await getWantToPlayUsers(gameIds);
      setWantToPlayUsers(wtpUsers);

      const khUsers = await getKnowHowToPlayUsers(gameIds);
      setKnowHowUsers(khUsers);
    };

    loadData();
  }, [game.id, gameIds, getUserPreference, getWantToPlayUsers, getKnowHowToPlayUsers]);

  const handlePreferenceChange = async (e) => {
    const value = parseInt(e.target.value);
    setPreference(value);
    await onPreferenceChange(game.id, value);
  };

  const handleKnowHowClick = async () => {
    await onToggleKnowHow(game.id);
  };

  const metadata = [];
  if (game.players) metadata.push(`👥 ${escapeHtml(game.players)}`);
  if (game.playTime) metadata.push(`⏱️ ${escapeHtml(game.playTime)}`);

  return (
    <div className="game-item">
      <div className="game-info">
        <div className="game-name">{escapeHtml(game.name)}</div>

        {!isMyGame && game.owners && (
          <div className="game-owner">
            owned by {game.owners.map((o) => escapeHtml(o.username)).join(', ')}
          </div>
        )}

        {metadata.length > 0 && (
          <div
            className="game-metadata"
            dangerouslySetInnerHTML={{ __html: metadata.join(' • ') }}
          />
        )}

        {game.description && (
          <div className="game-description">{escapeHtml(game.description)}</div>
        )}

        {wantToPlayUsers.length > 0 && (
          <div className="want-to-play-list">
            <div className="want-to-play-list-title">Wants to play:</div>
            <div className="want-to-play-users">
              {wantToPlayUsers.map((user) => (
                <div
                  key={user.username}
                  className={`user-badge ${getColorClass(user.preferenceValue)}`}
                >
                  {escapeHtml(user.username)}
                </div>
              ))}
            </div>
          </div>
        )}

        {knowHowUsers.length > 0 && (
          <div className="know-how-to-play-list">
            <div className="know-how-to-play-list-title">Knows how to play:</div>
            <div className="know-how-to-play-users">
              {knowHowUsers.map((username) => (
                <div key={username} className="user-badge user-badge-green">
                  {escapeHtml(username)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="game-actions">
        <select
          className="want-to-play-select"
          value={preference}
          onChange={handlePreferenceChange}
        >
          <option value="0">Not bothered</option>
          <option value="3">I'd quite like to play</option>
          <option value="4">I'd really like to play</option>
          <option value="5">I'm desperate to play</option>
        </select>

        {!isMyGame && !isOwnedByCurrentUser && (
          <button className="btn-primary btn-small know-how-to-play-btn" onClick={handleKnowHowClick}>
            Know How to Play
          </button>
        )}

        {isMyGame && (
          <button className="btn-danger btn-small" onClick={() => onDelete(game.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
