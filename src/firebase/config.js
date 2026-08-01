import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsYzShd8edV3mw59c8JUfl_QnbX9wOkuI",
  authDomain: "farm-manager-991c7.firebaseapp.com",
  projectId: "farm-manager-991c7",
  storageBucket: "farm-manager-991c7.firebasestorage.app",
  messagingSenderId: "611808768582",
  appId: "1:611808768582:web:ba1c94e19548e819bc9047"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); 