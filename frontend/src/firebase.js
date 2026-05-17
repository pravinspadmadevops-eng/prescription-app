// Import the functions you need from the SDKs you need
/*import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAi1OEtZucorqurP1G6IStqM8xGZUJK-9M",
  authDomain: "prescriptionapp-495417.firebaseapp.com",
  projectId: "prescriptionapp-495417",
  storageBucket: "prescriptionapp-495417.firebasestorage.app",
  messagingSenderId: "380490167885",
  appId: "1:380490167885:web:3a17fc74c0d2bd40ba4e04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;*/

import { initializeApp } from "firebase/app";

const firebaseConfig = {

  apiKey: "AIzaSyAi1OEtZucorqurP1G6IStqM8xGZUJK-9M",

  authDomain:
    "prescriptionapp-495417.firebaseapp.com",

  projectId:
    "prescriptionapp-495417",

  storageBucket:
    "prescriptionapp-495417.firebasestorage.app",

  messagingSenderId:
    "380490167885",

  appId:
    "1:380490167885:web:3a17fc74c0d2bd40ba4e04"

};

export const app =
  initializeApp(firebaseConfig);