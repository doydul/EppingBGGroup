import { useState } from 'react';

export default function AddEventForm({ onAddEvent, showError, showSuccess }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showError('Please enter an event title');
      return;
    }

    if (!date) {
      showError('Please select a date');
      return;
    }

    try {
      await onAddEvent({
        title: title.trim(),
        date: date
      });
      setTitle('');
      setDate('');
      showSuccess('Event added successfully!');
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="add-event-section">
      <h3>Add New Event</h3>
      <form onSubmit={handleSubmit}>
        <div className="event-input-group">
          <input
            type="text"
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Add Event
          </button>
        </div>
      </form>
    </div>
  );
}
