import { useState, useEffect } from 'react';

export default function EventModal({
  event,
  onClose,
  onUpdateDescription,
  rsvpUsers,
  suggestedGames,
  loadingSuggestions
}) {
  const [description, setDescription] = useState(event?.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDescription(event?.description || '');
    setIsEditing(false);
  }, [event]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSave = async () => {
    if (event.isVirtual) return;
    setSaving(true);
    try {
      await onUpdateDescription(event.id, description);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!event) return null;

  const preferenceLabels = {
    3: 'Quite like',
    4: 'Really like',
    5: 'Desperate'
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2>{event.title}</h2>
          {event.isVirtual && <span className="event-recurring-badge">Recurring</span>}
        </div>

        <div className="modal-date">{formatDate(event.date)}</div>

        <div className="modal-section">
          <h3>Description</h3>
          {event.isVirtual ? (
            <p className="modal-description-empty">RSVP to add a description</p>
          ) : isEditing ? (
            <div className="modal-description-edit">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this event..."
                rows={4}
              />
              <div className="modal-description-actions">
                <button
                  className="btn-small btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn-small btn-secondary"
                  onClick={() => {
                    setDescription(event.description || '');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="modal-description"
              onClick={() => setIsEditing(true)}
            >
              {description || <span className="modal-description-empty">Click to add a description...</span>}
            </div>
          )}
        </div>

        <div className="modal-section">
          <h3>Attending ({rsvpUsers.length})</h3>
          {rsvpUsers.length > 0 ? (
            <div className="modal-attendees">
              {rsvpUsers.map((rsvp) => (
                <span key={rsvp.id} className="user-badge user-badge-green">
                  {rsvp.username}
                </span>
              ))}
            </div>
          ) : (
            <p className="modal-empty">No one has RSVP'd yet</p>
          )}
        </div>

        <div className="modal-section">
          <h3>Your Games to Bring</h3>
          <p className="modal-section-hint">Based on what attendees want to play</p>
          {loadingSuggestions ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : suggestedGames.length > 0 ? (
            <div className="modal-suggested-games">
              {suggestedGames.map((game, index) => (
                <div key={index} className="suggested-game-item">
                  <div className="suggested-game-name">{game.name}</div>
                  <div className="suggested-game-users">
                    {game.interestedUsers.map((user, idx) => (
                      <span
                        key={idx}
                        className={`user-badge user-badge-${
                          user.preferenceValue === 5 ? 'red' :
                          user.preferenceValue === 4 ? 'orange' : 'yellow'
                        }`}
                        title={preferenceLabels[user.preferenceValue]}
                      >
                        {user.username}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="modal-empty">
              {rsvpUsers.length > 0
                ? 'No attendees want to play your games yet'
                : 'RSVP to see suggested games'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
