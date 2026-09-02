import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

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

// Keep ports in sync with firebase.json and scripts/seed.mjs.
const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORTS = {
  firestore: 8080,
  storage: 9199,
  functions: 5001,
} as const;

function useEmulators() {
  const value = String(process.env.NEXT_PUBLIC_TOASTBOARD_EMULATORS ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const functions = getFunctions(firebaseApp, "us-central1");
export const storage = getStorage(firebaseApp);

if (useEmulators()) {
  connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
  connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORTS.functions);
}
