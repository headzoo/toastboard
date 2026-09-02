"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { auth as firebaseAuthClient } from "./firebase";

async function exchangeFirebaseTokenForSession(user: User) {
  const idToken = await user.getIdToken();
  const result = await nextAuthSignIn("credentials", {
    idToken,
    redirect: false,
  });
  if (result?.error) {
    throw new Error("Couldn't sign you in. Please try again.");
  }
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuthClient, provider);
  await exchangeFirebaseTokenForSession(credential.user);
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuthClient, email, password);
  await exchangeFirebaseTokenForSession(credential.user);
}

export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuthClient, email, password);
  await exchangeFirebaseTokenForSession(credential.user);
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(firebaseAuthClient, email);
}

export async function signOutAll() {
  await firebaseSignOut(firebaseAuthClient);
  await nextAuthSignOut({ redirect: false });
}

export function watchFirebaseAuth(onUser: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuthClient, onUser);
}

export { firebaseAuthClient as firebaseAuth };
