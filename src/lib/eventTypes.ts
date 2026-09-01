export const EVENT_TYPES = [
  "wedding",
  "birthday",
  "graduation",
  "religious-milestone",
  "other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type EventCopyPack = {
  id: EventType;
  pickerLabel: string;
  marketed: boolean;
  marketingPath: string | null;
  displayNameLabel: string;
  displayNameHint: string;
  displayNamePlaceholder: string;
  displayNameRequiredError: string;
  displayNameFallback: string;
  createWelcomePlaceholder: string;
  defaultWelcomeMessage: string;
  guestKickerFallback: string;
  messageNoun: string;
  messageNounPlural: string;
  messageFieldLabel: string;
  messageFieldPlaceholder: string;
  submitButtonLabel: string;
  submitBusyLabel: string;
  submitErrorFallback: string;
  thankYouHeadline: string;
  leaveAnotherLabel: string;
  guestbookLoadingLabel: string;
  guestbookCtaLabel: string;
  guestbookEmptyLabel: string;
  moderationIntro: string;
  moderationEmptyLabel: string;
  hideConfirmLabel: string;
  hideButtonLabel: string;
  hideErrorFallback: string;
  slideshowQrPrompt: string;
  signKicker: string;
  signScanInstruction: string;
  signTagline: string;
  keepsafeLede: string;
  keepsafeBackupFolderHint: string;
};

const WEDDING_COPY: EventCopyPack = {
  id: "wedding",
  pickerLabel: "Wedding",
  marketed: true,
  marketingPath: "/weddings",
  displayNameLabel: "Couple’s names",
  displayNameHint: "Shown on the guest page and the guestbook.",
  displayNamePlaceholder: "Maya & James",
  displayNameRequiredError: "Please add the couple’s names.",
  displayNameFallback: "This wedding",
  createWelcomePlaceholder: "Leave us a toast — a memory, a wish, a terrible joke.",
  defaultWelcomeMessage: "Leave a toast — a memory, a wish, photos, or one short video. No account needed.",
  guestKickerFallback: "A wedding guestbook",
  messageNoun: "toast",
  messageNounPlural: "toasts",
  messageFieldLabel: "Your toast",
  messageFieldPlaceholder:
    "May your coffee always be hot and your inside jokes never make sense to anyone else.",
  submitButtonLabel: "Add to the guestbook",
  submitBusyLabel: "Sending…",
  submitErrorFallback: "Couldn’t send that toast.",
  thankYouHeadline: "Thank you! Your toast has been added 💌",
  leaveAnotherLabel: "Leave another toast",
  guestbookLoadingLabel: "Gathering toasts…",
  guestbookCtaLabel: "Leave a toast",
  guestbookEmptyLabel: "The first toast hasn’t been written yet. Scan the QR and be the first.",
  moderationIntro: "Hide a toast if you need to. Guests never see these buttons.",
  moderationEmptyLabel: "No toasts yet. Share the guest QR and they’ll land here.",
  hideConfirmLabel: "Remove this toast from the guestbook?",
  hideButtonLabel: "Hide toast",
  hideErrorFallback: "Couldn’t remove that toast.",
  slideshowQrPrompt: "Scan to leave a toast",
  signKicker: "LEAVE A TOAST",
  signScanInstruction: "Scan to leave a toast and upload photos or one short video.",
  signTagline: "No app. No login. It appears in the guestbook.",
  keepsafeLede:
    "{name}’s guestbook is live. Print the table sign for your venue. Keep the host link somewhere only you can find.",
  keepsafeBackupFolderHint:
    "A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like a wedding folder or password manager — so you can recover access if you lose this page.",
};

const BIRTHDAY_COPY: EventCopyPack = {
  id: "birthday",
  pickerLabel: "Birthday",
  marketed: true,
  marketingPath: "/birthdays",
  displayNameLabel: "Celebrant’s name",
  displayNameHint: "Shown on the guest page and the guestbook.",
  displayNamePlaceholder: "Lena",
  displayNameRequiredError: "Please add the celebrant’s name.",
  displayNameFallback: "This birthday",
  createWelcomePlaceholder: "Leave a wish — a memory, a joke, or a photo from the party.",
  defaultWelcomeMessage: "Leave a wish — a memory, a joke, photos, or one short video. No account needed.",
  guestKickerFallback: "A birthday guestbook",
  messageNoun: "wish",
  messageNounPlural: "wishes",
  messageFieldLabel: "Your wish",
  messageFieldPlaceholder: "Wishing you another year of joy, laughter, and terrible puns.",
  submitButtonLabel: "Add to the guestbook",
  submitBusyLabel: "Sending…",
  submitErrorFallback: "Couldn’t send that wish.",
  thankYouHeadline: "Thank you! Your wish has been added 💌",
  leaveAnotherLabel: "Leave another wish",
  guestbookLoadingLabel: "Gathering wishes…",
  guestbookCtaLabel: "Leave a wish",
  guestbookEmptyLabel: "The first wish hasn’t been written yet. Scan the QR and be the first.",
  moderationIntro: "Hide a wish if you need to. Guests never see these buttons.",
  moderationEmptyLabel: "No wishes yet. Share the guest QR and they’ll land here.",
  hideConfirmLabel: "Remove this wish from the guestbook?",
  hideButtonLabel: "Hide wish",
  hideErrorFallback: "Couldn’t remove that wish.",
  slideshowQrPrompt: "Scan to leave a wish",
  signKicker: "LEAVE A WISH",
  signScanInstruction: "Scan to leave a wish and upload photos or one short video.",
  signTagline: "No app. No login. It appears in the guestbook.",
  keepsafeLede:
    "{name}’s guestbook is live. Print the table sign for your party. Keep the host link somewhere only you can find.",
  keepsafeBackupFolderHint:
    "A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like a party folder or password manager — so you can recover access if you lose this page.",
};

const GRADUATION_COPY: EventCopyPack = {
  id: "graduation",
  pickerLabel: "Graduation",
  marketed: true,
  marketingPath: "/graduations",
  displayNameLabel: "Graduate’s name",
  displayNameHint: "Shown on the guest page and the guestbook.",
  displayNamePlaceholder: "Jordan",
  displayNameRequiredError: "Please add the graduate’s name.",
  displayNameFallback: "This graduation",
  createWelcomePlaceholder: "Leave a wish — advice, a memory, or congratulations for the grad.",
  defaultWelcomeMessage: "Leave a wish — advice, a memory, photos, or one short video. No account needed.",
  guestKickerFallback: "A graduation guestbook",
  messageNoun: "wish",
  messageNounPlural: "wishes",
  messageFieldLabel: "Your wish",
  messageFieldPlaceholder: "The world is wide open — go make something wonderful.",
  submitButtonLabel: "Add to the guestbook",
  submitBusyLabel: "Sending…",
  submitErrorFallback: "Couldn’t send that wish.",
  thankYouHeadline: "Thank you! Your wish has been added 💌",
  leaveAnotherLabel: "Leave another wish",
  guestbookLoadingLabel: "Gathering wishes…",
  guestbookCtaLabel: "Leave a wish",
  guestbookEmptyLabel: "The first wish hasn’t been written yet. Scan the QR and be the first.",
  moderationIntro: "Hide a wish if you need to. Guests never see these buttons.",
  moderationEmptyLabel: "No wishes yet. Share the guest QR and they’ll land here.",
  hideConfirmLabel: "Remove this wish from the guestbook?",
  hideButtonLabel: "Hide wish",
  hideErrorFallback: "Couldn’t remove that wish.",
  slideshowQrPrompt: "Scan to leave a wish",
  signKicker: "LEAVE A WISH",
  signScanInstruction: "Scan to leave a wish and upload photos or one short video.",
  signTagline: "No app. No login. It appears in the guestbook.",
  keepsafeLede:
    "{name}’s guestbook is live. Print the table sign for your celebration. Keep the host link somewhere only you can find.",
  keepsafeBackupFolderHint:
    "A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like a celebration folder or password manager — so you can recover access if you lose this page.",
};

const RELIGIOUS_MILESTONE_COPY: EventCopyPack = {
  id: "religious-milestone",
  pickerLabel: "Religious milestone",
  marketed: true,
  marketingPath: "/religious-milestones",
  displayNameLabel: "Honoree’s name",
  displayNameHint: "Shown on the guest page and the guestbook.",
  displayNamePlaceholder: "Noah",
  displayNameRequiredError: "Please add the honoree’s name.",
  displayNameFallback: "This celebration",
  createWelcomePlaceholder:
    "Leave a note — a blessing, a memory, or congratulations for this milestone.",
  defaultWelcomeMessage:
    "Leave a note — a blessing, a memory, photos, or one short video. No account needed.",
  guestKickerFallback: "A milestone guestbook",
  messageNoun: "note",
  messageNounPlural: "notes",
  messageFieldLabel: "Your note",
  messageFieldPlaceholder: "Mazel tov — may this milestone be the start of many good things.",
  submitButtonLabel: "Add to the guestbook",
  submitBusyLabel: "Sending…",
  submitErrorFallback: "Couldn’t send that note.",
  thankYouHeadline: "Thank you! Your note has been added 💌",
  leaveAnotherLabel: "Leave another note",
  guestbookLoadingLabel: "Gathering notes…",
  guestbookCtaLabel: "Leave a note",
  guestbookEmptyLabel: "The first note hasn’t been written yet. Scan the QR and be the first.",
  moderationIntro: "Hide a note if you need to. Guests never see these buttons.",
  moderationEmptyLabel: "No notes yet. Share the guest QR and they’ll land here.",
  hideConfirmLabel: "Remove this note from the guestbook?",
  hideButtonLabel: "Hide note",
  hideErrorFallback: "Couldn’t remove that note.",
  slideshowQrPrompt: "Scan to leave a note",
  signKicker: "LEAVE A NOTE",
  signScanInstruction: "Scan to leave a note and upload photos or one short video.",
  signTagline: "No app. No login. It appears in the guestbook.",
  keepsafeLede:
    "{name}’s guestbook is live. Print the table sign for your celebration. Keep the host link somewhere only you can find.",
  keepsafeBackupFolderHint:
    "A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like an event folder or password manager — so you can recover access if you lose this page.",
};

const OTHER_COPY: EventCopyPack = {
  id: "other",
  pickerLabel: "Other",
  marketed: false,
  marketingPath: null,
  displayNameLabel: "Event or host name",
  displayNameHint: "Shown on the guest page and the guestbook.",
  displayNamePlaceholder: "The Garcia Family Reunion",
  displayNameRequiredError: "Please add an event or host name.",
  displayNameFallback: "This event",
  createWelcomePlaceholder: "Leave a note — a memory, a greeting, or a photo from the day.",
  defaultWelcomeMessage: "Leave a note — a memory, a greeting, photos, or one short video. No account needed.",
  guestKickerFallback: "A guestbook",
  messageNoun: "note",
  messageNounPlural: "notes",
  messageFieldLabel: "Your note",
  messageFieldPlaceholder: "Thanks for being part of this day.",
  submitButtonLabel: "Add to the guestbook",
  submitBusyLabel: "Sending…",
  submitErrorFallback: "Couldn’t send that note.",
  thankYouHeadline: "Thank you! Your note has been added 💌",
  leaveAnotherLabel: "Leave another note",
  guestbookLoadingLabel: "Gathering notes…",
  guestbookCtaLabel: "Leave a note",
  guestbookEmptyLabel: "The first note hasn’t been written yet. Scan the QR and be the first.",
  moderationIntro: "Hide a note if you need to. Guests never see these buttons.",
  moderationEmptyLabel: "No notes yet. Share the guest QR and they’ll land here.",
  hideConfirmLabel: "Remove this note from the guestbook?",
  hideButtonLabel: "Hide note",
  hideErrorFallback: "Couldn’t remove that note.",
  slideshowQrPrompt: "Scan to leave a note",
  signKicker: "LEAVE A NOTE",
  signScanInstruction: "Scan to leave a note and upload photos or one short video.",
  signTagline: "No app. No login. It appears in the guestbook.",
  keepsafeLede:
    "{name}’s guestbook is live. Print the table sign for your venue. Keep the host link somewhere only you can find.",
  keepsafeBackupFolderHint:
    "A private printable card with your guest QR code, host link, and guest page. Save it somewhere only you can find — like an event folder or password manager — so you can recover access if you lose this page.",
};

export const EVENT_COPY_PACKS: Record<EventType, EventCopyPack> = {
  wedding: WEDDING_COPY,
  birthday: BIRTHDAY_COPY,
  graduation: GRADUATION_COPY,
  "religious-milestone": RELIGIOUS_MILESTONE_COPY,
  other: OTHER_COPY,
};

export const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((id) => ({
  id,
  label: EVENT_COPY_PACKS[id].pickerLabel,
  marketed: EVENT_COPY_PACKS[id].marketed,
  marketingPath: EVENT_COPY_PACKS[id].marketingPath,
}));

export const DEFAULT_EVENT_TYPE: EventType = "wedding";

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && EVENT_TYPES.includes(value as EventType);
}

export function normalizeEventType(value: unknown): EventType {
  return isEventType(value) ? value : DEFAULT_EVENT_TYPE;
}

export function getEventCopy(eventType: unknown): EventCopyPack {
  return EVENT_COPY_PACKS[normalizeEventType(eventType)];
}

export function formatKeepsafeLede(copy: EventCopyPack, displayName: string): string {
  return copy.keepsafeLede.replace("{name}", displayName);
}
