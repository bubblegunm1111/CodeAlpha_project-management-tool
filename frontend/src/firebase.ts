import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "foldable-pm-2026",
  appId: "1:432974862844:web:1c7ad1716e6def1a997a79",
  storageBucket: "foldable-pm-2026.firebasestorage.app",
  apiKey: "AIzaSyDhR4UGLGjbwV0fVlFs7BtKyOWqvdisbG4",
  authDomain: "foldable-pm-2026.firebaseapp.com",
  messagingSenderId: "432974862844"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
