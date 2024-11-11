// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Only this one is needed
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgKVTkOvEAFmD3klMdspSYCyhFjUdAY38",
  authDomain: "finalproject-e37f8.firebaseapp.com",
  projectId: "finalproject-e37f8",
  storageBucket: "finalproject-e37f8.firebasestorage.app",
  messagingSenderId: "808649889195",
  appId: "1:808649889195:web:ff8db9950953f9f00a2eee",
  measurementId: "G-PHFHQW640Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const Firestore = getFirestore(app);
const database = getDatabase(app); // No conflict here, only one `getDatabase` import
const db = getFirestore(app);

// Export the initialized Firebase services
export { app, analytics, auth, database, db, storage, Firestore, collection, query, where, getDocs, onAuthStateChanged };
