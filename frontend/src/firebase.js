import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAi1OEtZucorqurP1G6IStqM8xGZUJK-9M",
  authDomain: "prescriptionapp-495417.firebaseapp.com",
  projectId: "prescriptionapp-495417",
  storageBucket: "prescriptionapp-495417.firebasestorage.app",
  messagingSenderId: "380490167885",
  appId: "1:380490167885:web:3a17fc74c0d2bd40ba4e04"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// 🔥 IMPORTANT: export auth too
const auth = getAuth(app);

export { app, auth };