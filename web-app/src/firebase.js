import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web configuration for printestimator-112e5
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForPrintEstimator112e5ReplaceIfNeeded",
  authDomain: "printestimator-112e5.firebaseapp.com",
  projectId: "printestimator-112e5",
  storageBucket: "printestimator-112e5.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
