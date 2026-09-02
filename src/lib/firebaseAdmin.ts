import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

const PROJECT_ID = "toastboard";

let adminApp: App | undefined;
let adminAuth: Auth | undefined;

function shouldUseEmulators() {
  const value = String(process.env.NEXT_PUBLIC_TOASTBOARD_EMULATORS ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function ensureEmulatorEnv() {
  if (!shouldUseEmulators()) return;
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  }
}

export function getAdminAuth(): Auth {
  if (adminAuth) return adminAuth;

  ensureEmulatorEnv();

  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }),
        projectId: PROJECT_ID,
      });
    } else {
      adminApp = initializeApp({ projectId: PROJECT_ID });
    }
  } else {
    adminApp = getApps()[0];
  }

  adminAuth = getAuth(adminApp);
  return adminAuth;
}
