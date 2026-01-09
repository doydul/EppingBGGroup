export default function EventsList({
  events,
  loading,
  currentUserId,
  onDelete,
  onToggleRsvp,
  getRsvpUsers,
  hasUserRsvped,
  onEventClick
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRsvp = (e, event) => {
    e.stopPropagation();
    if (event.isVirtual) {
      onToggleRsvp(event.id, { title: event.title, date: event.date });
    } else {
      onToggleRsvp(event.id);
    }
  };

  const handleDelete = (e, eventId) => {
    e.stopPropagation();
    onDelete(eventId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <p>No events yet</p>
        <p className="empty-state-hint">Add an event using the form above</p>
      </div>
    );
  }

  return (
    <div className="events-grid">
      {events.map((event) => {
        const rsvpUsers = getRsvpUsers(event.id);
        const userHasRsvped = hasUserRsvped(event.id);

        return (
          <div
            key={event.id}
            className={`event-card ${event.isVirtual ? 'event-card-virtual' : ''}`}
            onClick={() => onEventClick(event)}
          >
            <div className="event-card-overlay">
              <div className="event-card-content">
                <div className="event-title">
                  {event.title}
                  {event.isVirtual && <span className="event-recurring-badge">Recurring</span>}
                </div>
                <div className="event-date">{formatDate(event.date)}</div>

                {rsvpUsers.length > 0 && (
                  <div className="event-rsvp-list">
                    <div className="event-rsvp-title">Attending:</div>
                    <div className="event-rsvp-users">
                      {rsvpUsers.map((rsvp) => (
                        <span key={rsvp.id} className="user-badge user-badge-green">
                          {rsvp.username}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="event-card-actions">
                <button
                  className={`btn-small ${userHasRsvped ? 'btn-success' : 'btn-primary'}`}
                  onClick={(e) => handleRsvp(e, event)}
                >
                  {userHasRsvped ? 'Going' : 'RSVP'}
                </button>

                {!event.isVirtual && event.createdBy === currentUserId && (
                  <button
                    className="btn-small btn-danger"
                    onClick={(e) => handleDelete(e, event.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
