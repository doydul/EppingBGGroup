import { useState, useEffect } from 'react';
import GameItem from './GameItem';
import SortControls from './SortControls';

function EmptyState({ isMyGames }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">🎲</div>
      <p>No games yet</p>
      <p className="empty-state-hint">
        {isMyGames
          ? 'Add your first board game to get started!'
          : 'Be the first to add a board game!'}
      </p>
    </div>
  );
}

export default function GamesList({
  games,
  isMyGames,
  currentUserId,
  sortType,
  onSortChange,
  onDelete,
  onPreferenceChange,
  onToggleKnowHow,
  getUserPreference,
  getWantToPlayUsers,
  getKnowHowToPlayUsers,
  getSortedGames,
  mergeGamesByTitle
}) {
  const [sortedGames, setSortedGames] = useState([]);

  useEffect(() => {
    const sortGames = async () => {
      let gamesToSort = games;

      if (!isMyGames && mergeGamesByTitle) {
        gamesToSort = mergeGamesByTitle(games);
      }

      const sorted = await getSortedGames(gamesToSort);
      setSortedGames(sorted);
    };

    sortGames();
  }, [games, isMyGames, sortType, getSortedGames, mergeGamesByTitle]);

  return (
    <>
      <SortControls sortType={sortType} onSortChange={onSortChange} />

      {sortedGames.length === 0 ? (
        <EmptyState isMyGames={isMyGames} />
      ) : (
        <div className="games-list">
          {sortedGames.map((game) => (
            <GameItem
              key={game.id}
              game={game}
              isMyGame={isMyGames}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onPreferenceChange={onPreferenceChange}
              onToggleKnowHow={onToggleKnowHow}
              getUserPreference={getUserPreference}
              getWantToPlayUsers={getWantToPlayUsers}
              getKnowHowToPlayUsers={getKnowHowToPlayUsers}
            />
          ))}
        </div>
      )}
    </>
  );
}
