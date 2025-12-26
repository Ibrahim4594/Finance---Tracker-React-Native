import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';
import { createUserProfile } from './firestoreService';

// Complete the web browser session
WebBrowser.maybeCompleteAuthSession();

// Google Web Client ID from Firebase Console
const GOOGLE_WEB_CLIENT_ID = '668005967132-62ikndgk9pdvoa2sltr3mskl08pldn0m.apps.googleusercontent.com';

// Android OAuth Client ID for Expo Go
const ANDROID_CLIENT_ID = '668005967132-27utccj75a45emig3so6n7hvc9l83dj0.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  return { request, response, promptAsync };
};

export const signInWithGoogle = async (idToken: string, accessToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const userCredential = await signInWithCredential(auth, credential);

    // Check if this is a new user
    if (userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime) {
      // New user - create profile
      await createUserProfile(
        userCredential.user.uid,
        userCredential.user.email || '',
        userCredential.user.displayName || 'User'
      );
    }

    return userCredential;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
