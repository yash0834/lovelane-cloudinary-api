import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA4WDHJenB8WaYks8G7CyX3TUjU1t3zJc4",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovelane-ae509"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovelane-ae509",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "lovelane-ae509"}.firebasestorage.app`,
  messagingSenderId: "501351251460",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:501351251460:android:3ca0cf26bff5463e96bf51",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
