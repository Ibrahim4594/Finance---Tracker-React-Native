import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQkPWcf25NAVzrgjKFLHGoxcHloR0MzsY",
  authDomain: "finance-tracker-750b3.firebaseapp.com",
  projectId: "finance-tracker-750b3",
  storageBucket: "finance-tracker-750b3.firebasestorage.app",
  messagingSenderId: "668005967132",
  appId: "1:668005967132:web:a4ef4ff8d0ceeb97e286d9",
  measurementId: "G-60PP3QFHC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
