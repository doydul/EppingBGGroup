import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';

const SORT_STORAGE_KEY = 'bggroup_sort';

export function useGames(userId) {
  const [myGames, setMyGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState(
    () => localStorage.getItem(SORT_STORAGE_KEY) || 'alphabetical'
  );

  const loadMyGames = useCallback(async () => {
    if (!userId) return;

    try {
      const gamesQuery = query(
        collection(db, 'games'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(gamesQuery);

      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMyGames(games);
    } catch (error) {
      console.error('Error loading my games:', error);
    }
  }, [userId]);

  const loadAllGames = useCallback(async () => {
    try {
      const gamesQuery = query(collection(db, 'games'));
      const snapshot = await getDocs(gamesQuery);

      const userCache = {};
      const games = [];

      for (const docSnap of snapshot.docs) {
        const gameData = docSnap.data();
        let username = userCache[gameData.userId];

        if (!username) {
          const userQuery = query(
            collection(db, 'users'),
            where('userId', '==', gameData.userId)
          );
          const userDocs = await getDocs(userQuery);
          if (!userDocs.empty) {
            username = userDocs.docs[0].data().username;
            userCache[gameData.userId] = username;
          } else {
            username = 'Unknown User';
          }
        }

        games.push({
          id: docSnap.id,
          ...gameData,
          username
        });
      }

      setAllGames(games);
    } catch (error) {
      console.error('Error loading all games:', error);
    }
  }, []);

  const refreshGames = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadMyGames(), loadAllGames()]);
    setLoading(false);
  }, [loadMyGames, loadAllGames]);

  useEffect(() => {
    if (userId) {
      refreshGames();
    }
  }, [userId, refreshGames]);

  const addGame = async (gameData) => {
    if (!userId) throw new Error('You must be signed in to add games');

    await addDoc(collection(db, 'games'), {
      userId,
      ...gameData,
      createdAt: new Date()
    });

    await refreshGames();
  };

  const addBulkGames = async (games) => {
    if (!userId) throw new Error('You must be signed in to add games');

    for (const game of games) {
      await addDoc(collection(db, 'games'), {
        userId,
        ...game,
        createdAt: new Date()
      });
    }

    await refreshGames();
    return games.length;
  };

  const deleteGame = async (gameId) => {
    await deleteDoc(doc(db, 'games', gameId));
    await refreshGames();
  };

  const changeSortType = (newSortType) => {
    setSortType(newSortType);
    localStorage.setItem(SORT_STORAGE_KEY, newSortType);
  };

  const getSortedGames = useCallback(
    async (games) => {
      if (sortType === 'alphabetical') {
        return [...games].sort((a, b) => a.name.localeCompare(b.name));
      }

      if (sortType === 'wantToPlay') {
        const gamesWithTotals = await Promise.all(
          games.map(async (game) => {
            const gameIds = game.gameIds || [game.id];
            let totalPreferenceValue = 0;

            for (const gameId of gameIds) {
              const wtpQuery = query(
                collection(db, 'wantToPlay'),
                where('gameId', '==', gameId)
              );
              const snapshot = await getDocs(wtpQuery);
              snapshot.forEach((doc) => {
                totalPreferenceValue += doc.data().preferenceValue || 0;
              });
            }

            return { ...game, totalPreferenceValue };
          })
        );

        return gamesWithTotals.sort(
          (a, b) => b.totalPreferenceValue - a.totalPreferenceValue
        );
      }

      return games;
    },
    [sortType]
  );

  const mergeGamesByTitle = useCallback((games) => {
    const mergedMap = {};

    games.forEach((game) => {
      const titleKey = game.name.toLowerCase();

      if (!mergedMap[titleKey]) {
        mergedMap[titleKey] = {
          id: game.id,
          name: game.name,
          players: game.players,
          playTime: game.playTime,
          description: game.description,
          owners: [{ userId: game.userId, username: game.username }],
          gameIds: [game.id]
        };
      } else {
        const owner = { userId: game.userId, username: game.username };
        if (!mergedMap[titleKey].owners.some((o) => o.userId === game.userId)) {
          mergedMap[titleKey].owners.push(owner);
        }
        if (!mergedMap[titleKey].gameIds.includes(game.id)) {
          mergedMap[titleKey].gameIds.push(game.id);
        }
      }
    });

    return Object.values(mergedMap);
  }, []);

  return {
    myGames,
    allGames,
    loading,
    sortType,
    changeSortType,
    addGame,
    addBulkGames,
    deleteGame,
    getSortedGames,
    mergeGamesByTitle,
    refreshGames
  };
}
