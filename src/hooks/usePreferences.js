import { useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export function usePreferences(userId, username) {
  const [loading, setLoading] = useState(false);

  const getUserPreference = useCallback(
    async (gameId) => {
      if (!userId) return 0;

      const wtpQuery = query(
        collection(db, 'wantToPlay'),
        where('gameId', '==', gameId),
        where('userId', '==', userId)
      );
      const wtpDocs = await getDocs(wtpQuery);

      if (!wtpDocs.empty) {
        return wtpDocs.docs[0].data().preferenceValue || 0;
      }
      return 0;
    },
    [userId]
  );

  const setWantToPlayPreference = async (gameId, preferenceValue, onComplete) => {
    if (!userId) throw new Error('You must be signed in');

    setLoading(true);
    try {
      const wtpQuery = query(
        collection(db, 'wantToPlay'),
        where('gameId', '==', gameId),
        where('userId', '==', userId)
      );
      const wtpDocs = await getDocs(wtpQuery);

      if (!wtpDocs.empty) {
        if (preferenceValue === 0) {
          await deleteDoc(doc(db, 'wantToPlay', wtpDocs.docs[0].id));
        } else {
          await updateDoc(doc(db, 'wantToPlay', wtpDocs.docs[0].id), {
            preferenceValue,
            updatedAt: new Date()
          });
        }
      } else if (preferenceValue > 0) {
        await addDoc(collection(db, 'wantToPlay'), {
          gameId,
          userId,
          username,
          preferenceValue,
          createdAt: new Date()
        });
      }

      if (onComplete) onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getWantToPlayUsers = useCallback(async (gameIds) => {
    const userMap = {};

    for (const gameId of gameIds) {
      const wtpQuery = query(
        collection(db, 'wantToPlay'),
        where('gameId', '==', gameId)
      );
      const snapshot = await getDocs(wtpQuery);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if ((data.preferenceValue || 0) >= 3) {
          const uname = data.username;
          if (!userMap[uname] || userMap[uname] < data.preferenceValue) {
            userMap[uname] = data.preferenceValue;
          }
        }
      });
    }

    return Object.entries(userMap).map(([uname, preferenceValue]) => ({
      username: uname,
      preferenceValue
    }));
  }, []);

  const toggleKnowHowToPlay = async (gameId, onComplete) => {
    if (!userId) throw new Error('You must be signed in');

    setLoading(true);
    try {
      const khttpQuery = query(
        collection(db, 'knowHowToPlay'),
        where('gameId', '==', gameId),
        where('userId', '==', userId)
      );
      const khttpDocs = await getDocs(khttpQuery);

      if (!khttpDocs.empty) {
        await deleteDoc(doc(db, 'knowHowToPlay', khttpDocs.docs[0].id));
      } else {
        await addDoc(collection(db, 'knowHowToPlay'), {
          gameId,
          userId,
          username,
          createdAt: new Date()
        });
      }

      if (onComplete) onComplete();
    } finally {
      setLoading(false);
    }
  };

  const getKnowHowToPlayUsers = useCallback(async (gameIds) => {
    const userSet = new Set();

    for (const gameId of gameIds) {
      const khttpQuery = query(
        collection(db, 'knowHowToPlay'),
        where('gameId', '==', gameId)
      );
      const snapshot = await getDocs(khttpQuery);

      snapshot.forEach((doc) => {
        userSet.add(doc.data().username);
      });
    }

    return Array.from(userSet);
  }, []);

  return {
    loading,
    getUserPreference,
    setWantToPlayPreference,
    getWantToPlayUsers,
    toggleKnowHowToPlay,
    getKnowHowToPlayUsers
  };
}
