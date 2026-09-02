'use client';

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import { auth as firebaseAuthClient } from './firebase';
import { toFriendlyError } from './friendlyErrors';

async function exchangeFirebaseTokenForSession(user: User) {
  const idToken = await user.getIdToken();
  const result = await nextAuthSignIn('credentials', {
    idToken,
    redirect: false,
  });
  if (result?.error) {
    throw new Error('Couldn’t sign you in. Please try again.');
  }
}

/** Resolve once Firebase has restored auth from persistence (first onAuthStateChanged). */
export function waitForFirebaseAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(firebaseAuthClient, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(firebaseAuthClient, provider);
    await exchangeFirebaseTokenForSession(credential.user);
  } catch (error) {
    throw toFriendlyError(error, 'Couldn’t sign you in with Google.');
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuthClient,
      email,
      password,
    );
    await exchangeFirebaseTokenForSession(credential.user);
  } catch (error) {
    throw toFriendlyError(error, 'Couldn’t sign you in. Please try again.');
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuthClient,
      email,
      password,
    );
    await exchangeFirebaseTokenForSession(credential.user);
  } catch (error) {
    throw toFriendlyError(error, 'Couldn’t sign you in. Please try again.');
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(firebaseAuthClient, email);
  } catch (error) {
    throw toFriendlyError(
      error,
      'Couldn’t send that reset link. Please try again.',
    );
  }
}

export async function signOutAll() {
  await firebaseSignOut(firebaseAuthClient);
  await nextAuthSignOut({ redirect: false });
}

export function watchFirebaseAuth(onUser: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuthClient, onUser);
}

export { firebaseAuthClient as firebaseAuth };
