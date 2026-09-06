import { create } from 'zustand';

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  expiry: number; // Date.now() ms when it expires
  email?: string;
}

export interface NotificationPrefs {
  taskReminders: boolean;
  jobMatchAlerts: boolean;
  workshopAnnouncements: boolean;
}

interface SettingsState {
  geminiApiKey: string;
  useLiveAI: boolean;
  gmailTokens: GmailTokens | null;
  notificationPrefs: NotificationPrefs;
  setGeminiApiKey: (key: string) => void;
  setUseLiveAI: (val: boolean) => void;
  setGmailTokens: (tokens: GmailTokens | null) => void;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;
  getGoogleClientId: () => string;
  getGoogleClientSecret: () => string;
  getGoogleRedirectUri: () => string;
}

const STORAGE_KEY_GEMINI = 'suhail_gemini_api_key';
const STORAGE_KEY_LIVE_AI = 'suhail_use_live_ai';
const STORAGE_KEY_GMAIL = 'suhail_gmail_tokens';
const STORAGE_KEY_NOTIF = 'suhail_notification_prefs';

const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  taskReminders: true,
  jobMatchAlerts: true,
  workshopAnnouncements: false,
};

function loadGmailTokens(): GmailTokens | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GMAIL);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.access_token && parsed.expiry > Date.now()) {
        return parsed;
      }
    }
  } catch {
    /* noop */
  }
  return null;
}

function loadNotifPrefs(): NotificationPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIF);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_NOTIF_PREFS, ...parsed };
    }
  } catch {
    /* noop */
  }
  return { ...DEFAULT_NOTIF_PREFS };
}

export const useSettingsStore = create<SettingsState>((set) => ({
  geminiApiKey: (() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GEMINI) || '';
    } catch {
      return '';
    }
  })(),
  useLiveAI: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIVE_AI);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  })(),
  gmailTokens: loadGmailTokens(),
  notificationPrefs: loadNotifPrefs(),

  setGeminiApiKey: (key: string) => {
    try {
      localStorage.setItem(STORAGE_KEY_GEMINI, key);
    } catch {
      /* noop */
    }
    set({ geminiApiKey: key });
  },

  setUseLiveAI: (val: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY_LIVE_AI, val ? 'true' : 'false');
    } catch {
      /* noop */
    }
    set({ useLiveAI: val });
  },

  setGmailTokens: (tokens: GmailTokens | null) => {
    if (tokens) {
      try {
        localStorage.setItem(STORAGE_KEY_GMAIL, JSON.stringify(tokens));
      } catch {
        /* noop */
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY_GMAIL);
      } catch {
        /* noop */
      }
    }
    set({ gmailTokens: tokens });
  },

  setNotificationPref: (key, value) => {
    set((s) => {
      const prefs = { ...s.notificationPrefs, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(prefs));
      } catch {
        /* noop */
      }
      return { notificationPrefs: prefs };
    });
  },

  getGoogleClientId: () => (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '',
  // The Google client secret lives only server-side (see /api/google-token).
  // It is intentionally never exposed to the browser.
  getGoogleClientSecret: () => '',
  getGoogleRedirectUri: () =>
    (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string) ||
    `${window.location.origin}/auth/callback`,
}));
