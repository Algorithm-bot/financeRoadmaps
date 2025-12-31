// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLuNJ2dLtnjT5iQPDuwSGPVa_IwrqY_gA",
  authDomain: "finance-a7874.firebaseapp.com",
  projectId: "finance-a7874",
  storageBucket: "finance-a7874.firebasestorage.app",
  messagingSenderId: "625685641954",
  appId: "1:625685641954:web:558692244895ba8791fcbb",
  measurementId: "G-Q6CWHWGCXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth };






