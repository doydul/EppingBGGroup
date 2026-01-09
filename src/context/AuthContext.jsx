import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext(null);

const STORAGE_KEY = 'bggroup_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const normalizedUsername = username.trim().toLowerCase();

    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername)
    );
    const userDocs = await getDocs(usersQuery);

    if (userDocs.empty) {
      throw new Error('Username or password incorrect');
    }

    const userDoc = userDocs.docs[0];
    const userData = userDoc.data();

    if (userData.password !== password) {
      throw new Error('Username or password incorrect');
    }

    const user = {
      id: userData.userId,
      username: userData.username,
      docId: userDoc.id
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const signup = async (username, password) => {
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', normalizedUsername)
    );
    const existingUsers = await getDocs(usersQuery);

    if (!existingUsers.empty) {
      throw new Error('Username already taken');
    }

    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    await addDoc(collection(db, 'users'), {
      userId,
      username: normalizedUsername,
      password,
      createdAt: new Date()
    });

    return login(normalizedUsername, password);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
