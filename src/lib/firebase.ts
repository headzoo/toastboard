import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "toastboard",
  "appId": "1:695090103004:web:71de06a692807c4afaea19",
  "storageBucket": "toastboard.firebasestorage.app",
  "apiKey": "AIzaSyAQSSPFYToH69ZcM8i73awb4MTQS8CXpQc",
  "authDomain": "toastboard.firebaseapp.com",
  "messagingSenderId": "695090103004",
  "projectNumber": "695090103004",
  "version": "2"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
