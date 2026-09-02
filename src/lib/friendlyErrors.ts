const AUTH_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "That email is already tied to an account. Try signing in instead.",
  "auth/invalid-email": "That doesn’t look like a valid email address.",
  "auth/invalid-credential":
    "That email and password don’t match. Check both and try again.",
  "auth/wrong-password":
    "That email and password don’t match. Check both and try again.",
  "auth/user-not-found":
    "That email and password don’t match. Check both and try again.",
  "auth/weak-password": "Choose a password with at least six characters.",
  "auth/too-many-requests": "Too many tries. Wait a moment, then try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/network-request-failed":
    "Couldn’t reach the server. Check your connection and try again.",
  "auth/operation-not-allowed": "That sign-in method isn’t available right now.",
};

const FIRESTORE_MESSAGES: Record<string, string> = {
  "permission-denied":
    "We couldn’t load your guestbooks. Try signing out and back in.",
  unavailable: "Couldn’t reach the server. Try again in a moment.",
  "deadline-exceeded": "Couldn’t reach the server. Try again in a moment.",
};

function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return "";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

/** Map Firebase (and similar) errors to warm, plain-spoken copy. */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  const code = errorCode(error);
  const message = errorMessage(error);
  const combined = `${code} ${message}`;

  if (code in AUTH_MESSAGES) return AUTH_MESSAGES[code];
  if (code in FIRESTORE_MESSAGES) return FIRESTORE_MESSAGES[code];

  // Firestore sometimes surfaces codes without the firestore/ prefix in .code,
  // and sometimes only in the message ("Missing or insufficient permissions.").
  if (/permission-denied|Missing or insufficient permissions/i.test(combined)) {
    return FIRESTORE_MESSAGES["permission-denied"];
  }
  if (/unavailable|deadline-exceeded/i.test(combined)) {
    return FIRESTORE_MESSAGES.unavailable;
  }

  if (/functions\/(permission-denied|invalid-argument)|Host link is not valid/i.test(message)) {
    return "That host link isn’t valid for this guestbook.";
  }
  if (/functions\/(not-found|unavailable|internal|deadline-exceeded)/i.test(combined)) {
    return fallback;
  }
  if (/storage\/unauthorized|storage\/retry-limit/i.test(message)) {
    return "Media upload isn’t available yet. Send a note for now, or try again shortly.";
  }

  // Avoid leaking raw Firebase / backend strings into the UI.
  if (
    /^Firebase:\s/i.test(message) ||
    /\(auth\//i.test(message) ||
    /Missing or insufficient permissions/i.test(message) ||
    /firestore\//i.test(combined) ||
    /functions\//i.test(combined) ||
    /storage\//i.test(combined)
  ) {
    return fallback;
  }

  if (message) return message;
  return fallback;
}

export function toFriendlyError(error: unknown, fallback: string): Error {
  return new Error(friendlyErrorMessage(error, fallback));
}
