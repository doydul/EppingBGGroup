import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDLzB5nnkUH0qZYEAZHg9nfqtduM2Ec0rE",
  authDomain: "bggroup-7d4d9.firebaseapp.com",
  projectId: "bggroup-7d4d9",
  storageBucket: "bggroup-7d4d9.firebasestorage.app",
  messagingSenderId: "222041321602",
  appId: "1:222041321602:web:83cb5b8ed3f73ea9bdc49b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
