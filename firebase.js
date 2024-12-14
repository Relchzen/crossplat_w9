// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEcNASqQgp1abJUtky4wk6Ry6SOBU6BrQ",
  authDomain: "if670-crossplatform.firebaseapp.com",
  projectId: "if670-crossplatform",
  storageBucket: "if670-crossplatform.firebasestorage.app",
  messagingSenderId: "726388990740",
  appId: "1:726388990740:web:382c0083836ba3fdb7d801"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)
export const storage = getStorage()

export default firebaseConfig