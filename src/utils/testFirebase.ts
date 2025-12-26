// Test Firebase Connection
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase Connection...');

    // Test Auth
    console.log('✅ Firebase Auth initialized:', auth.app.name);
    console.log('📧 Current user:', auth.currentUser?.email || 'Not logged in');

    // Test Firestore
    console.log('✅ Firestore initialized:', db.app.name);

    // Try to read from Firestore (should work even if empty)
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Firestore connection successful! Documents:', snapshot.size);

    console.log('🎉 Firebase is fully configured and working!');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection error:', error.message);
    return false;
  }
};
