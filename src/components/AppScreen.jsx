import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGames } from '../hooks/useGames';
import { usePreferences } from '../hooks/usePreferences';
import { useEvents } from '../hooks/useEvents';
import { AddGameForm, GamesList } from './Games';
import { EventsList, AddEventForm, EventModal } from './Events';

export default function AppScreen() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('bggroup_tab') || 'my'
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [suggestedGames, setSuggestedGames] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const {
    myGames,
    allGames,
    sortType,
    changeSortType,
    addGame,
    addBulkGames,
    deleteGame,
    getSortedGames,
    mergeGamesByTitle,
    refreshGames
  } = useGames(currentUser?.id);

  const {
    getUserPreference,
    setWantToPlayPreference,
    getWantToPlayUsers,
    toggleKnowHowToPlay,
    getKnowHowToPlayUsers
  } = usePreferences(currentUser?.id, currentUser?.username);

  const {
    events,
    loading: eventsLoading,
    addEvent,
    deleteEvent,
    toggleRsvp,
    getRsvpUsers,
    hasUserRsvped,
    updateEventDescription,
    getSuggestedGames
  } = useEvents(currentUser?.id, currentUser?.username);

  const changeTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('bggroup_tab', tab);
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handlePreferenceChange = async (gameId, value) => {
    try {
      await setWantToPlayPreference(gameId, value, refreshGames);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleToggleKnowHow = async (gameId) => {
    try {
      await toggleKnowHowToPlay(gameId, refreshGames);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDelete = async (gameId) => {
    try {
      await deleteGame(gameId);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setSuggestedGames([]);
    setLoadingSuggestions(true);

    try {
      const games = await getSuggestedGames(event.id);
      setSuggestedGames(games);
    } catch (err) {
      console.error('Error loading suggested games:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSuggestedGames([]);
  };

  return (
    <div className="app-screen active">
      <div className="app-header">
        <div>
          <h1>Board Game Collection</h1>
          <p className="user-info">{currentUser?.username}</p>
        </div>
      </div>

      {error && <div className="error show">{error}</div>}
      {success && <div className="success show">{success}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => changeTab('my')}
        >
          My Games
        </button>
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => changeTab('all')}
        >
          All Games
        </button>
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => changeTab('events')}
        >
          Events
        </button>
      </div>

      {activeTab === 'my' && (
        <div className="tab-content active">
          <AddGameForm
            onAddGame={addGame}
            onAddBulkGames={addBulkGames}
            showError={showError}
            showSuccess={showSuccess}
          />
          <GamesList
            games={myGames}
            isMyGames={true}
            currentUserId={currentUser?.id}
            sortType={sortType}
            onSortChange={changeSortType}
            onDelete={handleDelete}
            onPreferenceChange={handlePreferenceChange}
            onToggleKnowHow={handleToggleKnowHow}
            getUserPreference={getUserPreference}
            getWantToPlayUsers={getWantToPlayUsers}
            getKnowHowToPlayUsers={getKnowHowToPlayUsers}
            getSortedGames={getSortedGames}
          />
        </div>
      )}

      {activeTab === 'all' && (
        <div className="tab-content active">
          <GamesList
            games={allGames}
            isMyGames={false}
            currentUserId={currentUser?.id}
            sortType={sortType}
            onSortChange={changeSortType}
            onDelete={handleDelete}
            onPreferenceChange={handlePreferenceChange}
            onToggleKnowHow={handleToggleKnowHow}
            getUserPreference={getUserPreference}
            getWantToPlayUsers={getWantToPlayUsers}
            getKnowHowToPlayUsers={getKnowHowToPlayUsers}
            getSortedGames={getSortedGames}
            mergeGamesByTitle={mergeGamesByTitle}
          />
        </div>
      )}

      {activeTab === 'events' && (
        <div className="tab-content active">
          <AddEventForm
            onAddEvent={addEvent}
            showError={showError}
            showSuccess={showSuccess}
          />
          <EventsList
            events={events}
            loading={eventsLoading}
            currentUserId={currentUser?.id}
            onDelete={deleteEvent}
            onToggleRsvp={toggleRsvp}
            getRsvpUsers={getRsvpUsers}
            hasUserRsvped={hasUserRsvped}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onUpdateDescription={updateEventDescription}
          rsvpUsers={getRsvpUsers(selectedEvent.id)}
          suggestedGames={suggestedGames}
          loadingSuggestions={loadingSuggestions}
        />
      )}
    </div>
  );
}
