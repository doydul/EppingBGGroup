import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

const WEEKLY_MEETUP_TITLE = 'Weekly Meetup';

function getNextMonday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  return nextMonday.toISOString().split('T')[0];
}

export function useEvents(userId, username) {
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpCache, setRsvpCache] = useState({});

  const loadEvents = useCallback(async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(eventsQuery);

      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setDbEvents(eventsList);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllRsvps = useCallback(async () => {
    try {
      const rsvpsQuery = query(collection(db, 'eventRsvps'));
      const snapshot = await getDocs(rsvpsQuery);

      const cache = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!cache[data.eventId]) {
          cache[data.eventId] = [];
        }
        cache[data.eventId].push({
          id: doc.id,
          ...data
        });
      });

      setRsvpCache(cache);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadAllRsvps();
  }, [loadEvents, loadAllRsvps]);

  // Build a map of duplicate event IDs for RSVP aggregation
  const duplicateEventIds = useMemo(() => {
    const keyToIds = new Map();

    for (const event of dbEvents) {
      const key = `${event.title.toLowerCase()}|${event.date}`;
      if (!keyToIds.has(key)) {
        keyToIds.set(key, []);
      }
      keyToIds.get(key).push(event.id);
    }

    // Map each event ID to all IDs that share the same title+date
    const idToAllIds = new Map();
    for (const ids of keyToIds.values()) {
      for (const id of ids) {
        idToAllIds.set(id, ids);
      }
    }

    return idToAllIds;
  }, [dbEvents]);

  // Merge database events with virtual Monday event, deduplicating by title+date
  const events = useMemo(() => {
    const nextMonday = getNextMonday();

    // Deduplicate events by title+date, keeping the oldest (first created)
    const seen = new Map();
    const deduplicatedEvents = [];

    // Sort by createdAt to keep the oldest
    const sortedDbEvents = [...dbEvents].sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return aTime - bTime;
    });

    for (const event of sortedDbEvents) {
      const key = `${event.title.toLowerCase()}|${event.date}`;
      if (!seen.has(key)) {
        seen.set(key, event);
        deduplicatedEvents.push(event);
      }
    }

    const hasMondayEvent = deduplicatedEvents.some(
      e => e.title === WEEKLY_MEETUP_TITLE && e.date === nextMonday
    );

    const virtualEvents = hasMondayEvent ? [] : [{
      id: `virtual-${nextMonday}`,
      title: WEEKLY_MEETUP_TITLE,
      date: nextMonday,
      isVirtual: true
    }];

    const allEvents = [...deduplicatedEvents, ...virtualEvents];
    allEvents.sort((a, b) => a.date.localeCompare(b.date));

    return allEvents;
  }, [dbEvents]);

  const addEvent = async (eventData) => {
    if (!userId) throw new Error('You must be signed in to add events');

    await addDoc(collection(db, 'events'), {
      ...eventData,
      createdBy: userId,
      createdAt: new Date()
    });

    await loadEvents();
  };

  const deleteEvent = async (eventId) => {
    await deleteDoc(doc(db, 'events', eventId));
    await loadEvents();
  };

  const toggleRsvp = async (eventId, eventData = null) => {
    if (!userId) throw new Error('You must be signed in to RSVP');

    let actualEventId = eventId;

    // If this is a virtual event, check if one already exists before creating
    if (eventId.startsWith('virtual-') && eventData) {
      // Check if an event with same title and date already exists
      const existingQuery = query(
        collection(db, 'events'),
        where('title', '==', eventData.title),
        where('date', '==', eventData.date)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.docs.length > 0) {
        // Use existing event
        actualEventId = existingSnapshot.docs[0].id;
      } else {
        // Create new event
        const docRef = await addDoc(collection(db, 'events'), {
          title: eventData.title,
          date: eventData.date,
          createdBy: 'system',
          createdAt: new Date()
        });
        actualEventId = docRef.id;
      }
      await loadEvents();
    }

    const existingRsvp = rsvpCache[actualEventId]?.find(r => r.userId === userId);

    if (existingRsvp) {
      await deleteDoc(doc(db, 'eventRsvps', existingRsvp.id));
    } else {
      await addDoc(collection(db, 'eventRsvps'), {
        eventId: actualEventId,
        userId,
        username,
        createdAt: new Date()
      });
    }

    await loadAllRsvps();
  };

  const getRsvpUsers = (eventId) => {
    // Aggregate RSVPs from all duplicate event IDs
    const allIds = duplicateEventIds.get(eventId) || [eventId];
    const allRsvps = [];
    const seenUserIds = new Set();

    for (const id of allIds) {
      const rsvps = rsvpCache[id] || [];
      for (const rsvp of rsvps) {
        if (!seenUserIds.has(rsvp.userId)) {
          seenUserIds.add(rsvp.userId);
          allRsvps.push(rsvp);
        }
      }
    }

    return allRsvps;
  };

  const hasUserRsvped = (eventId) => {
    // Check RSVPs across all duplicate event IDs
    const allIds = duplicateEventIds.get(eventId) || [eventId];
    for (const id of allIds) {
      if (rsvpCache[id]?.some(r => r.userId === userId)) {
        return true;
      }
    }
    return false;
  };

  const updateEventDescription = async (eventId, description) => {
    await updateDoc(doc(db, 'events', eventId), {
      description,
      updatedAt: new Date()
    });
    await loadEvents();
  };

  const getSuggestedGames = useCallback(async (eventId) => {
    const rsvpUsers = rsvpCache[eventId] || [];
    if (rsvpUsers.length === 0) return [];
    if (!userId) return [];

    const attendeeUserIds = rsvpUsers.map(r => r.userId);

    // Get games owned by the current user
    const myGamesQuery = query(
      collection(db, 'games'),
      where('userId', '==', userId)
    );
    const myGamesSnapshot = await getDocs(myGamesQuery);

    const myGames = {};
    myGamesSnapshot.docs.forEach((doc) => {
      myGames[doc.id] = doc.data().name;
    });

    const myGameIds = Object.keys(myGames);
    if (myGameIds.length === 0) return [];

    // Get all wantToPlay entries for attending users, filtered to games I own
    const wtpQuery = query(collection(db, 'wantToPlay'));
    const wtpSnapshot = await getDocs(wtpQuery);

    const gamePreferences = {};
    wtpSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (
        attendeeUserIds.includes(data.userId) &&
        data.preferenceValue >= 3 &&
        myGameIds.includes(data.gameId)
      ) {
        if (!gamePreferences[data.gameId]) {
          gamePreferences[data.gameId] = [];
        }
        gamePreferences[data.gameId].push({
          username: data.username,
          preferenceValue: data.preferenceValue
        });
      }
    });

    const gameIds = Object.keys(gamePreferences);
    if (gameIds.length === 0) return [];

    // Build suggested games list, sorted by total preference value
    const suggestedGames = gameIds
      .map((gameId) => ({
        gameId,
        name: myGames[gameId] || 'Unknown Game',
        interestedUsers: gamePreferences[gameId].sort((a, b) => b.preferenceValue - a.preferenceValue),
        totalScore: gamePreferences[gameId].reduce((sum, u) => sum + u.preferenceValue, 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Dedupe by game name (case-insensitive)
    const seen = new Set();
    return suggestedGames.filter((game) => {
      const key = game.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rsvpCache, userId]);

  return {
    events,
    loading,
    addEvent,
    deleteEvent,
    toggleRsvp,
    getRsvpUsers,
    hasUserRsvped,
    updateEventDescription,
    getSuggestedGames,
    refreshEvents: loadEvents
  };
}
