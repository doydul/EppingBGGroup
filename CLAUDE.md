# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Board Game Collection App - A React application for managing board game collections with Firebase/Firestore backend.

## Development

```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
```

## Architecture

### Project Structure
```
src/
├── components/
│   ├── Auth/           # Authentication components
│   │   ├── AuthScreen.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Games/          # Game management components
│   │   ├── AddGameForm.jsx
│   │   ├── GameItem.jsx
│   │   ├── GamesList.jsx
│   │   └── SortControls.jsx
│   ├── Events/         # Event management components
│   │   ├── AddEventForm.jsx
│   │   ├── EventsList.jsx
│   │   └── index.js
│   └── AppScreen.jsx   # Main app after login
├── context/
│   └── AuthContext.jsx # User auth state management
├── hooks/
│   ├── useGames.js     # Game CRUD operations
│   ├── usePreferences.js # Want-to-play/know-how-to-play
│   └── useEvents.js    # Event CRUD operations
├── firebase/
│   └── config.js       # Firebase initialization
├── styles/
│   └── index.css       # All styles
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

### Firebase Collections
- `games` - Board games (userId, name, players, playTime, description, createdAt)
- `users` - User accounts with custom auth (userId, username, password, createdAt)
- `wantToPlay` - User preferences for games (gameId, userId, username, preferenceValue 0-5)
- `knowHowToPlay` - Users who know how to play games (gameId, userId, username)
- `events` - Events (title, date, description, createdBy, createdAt)
- `eventRsvps` - Event RSVPs (eventId, userId, username, createdAt)

### Key Features
- **Three tabs**: "My Games" (user's collection), "All Games" (aggregated, deduplicated by title), and "Events"
- **Custom auth**: Username/password stored in Firestore (not Firebase Auth)
- **Session persistence**: `localStorage` with key `bggroup_user`
- **Tab persistence**: Active tab saved to `localStorage` with key `bggroup_tab`
- **Sort preference**: Saved to `localStorage` with key `bggroup_sort`
- **Game deduplication**: In "All Games" tab, games with same title (case-insensitive) are merged
- **Preference levels**: Want-to-play has 4 levels (3=quite like, 4=really like, 5=desperate)
- **Events**: Users can create events with title and date; RSVP to events; only creator can delete their events
- **Event details modal**: Click event to open popup with editable description and suggested games based on attendees' want-to-play preferences
- **Weekly Meetup**: Virtual recurring event appears for next Monday; only saved to database when first RSVP is made

### State Management
- `AuthContext` - Manages user authentication state
- `useGames` hook - Handles game data fetching, adding, deleting, and sorting
- `usePreferences` hook - Handles want-to-play and know-how-to-play preferences
- `useEvents` hook - Handles event creation, listing, and deletion

## Firebase Configuration

Config is in `src/firebase/config.js`. To use a different Firebase project, update the `firebaseConfig` object.
