import { create } from 'zustand';
import type { Profile } from '../types';
import { getSupabase } from '../lib/supabase';
import { useTaskStore } from './taskStore';
import { useUIStore } from './uiStore';

/**
 * Auth backed by Supabase Auth (JWT sessions). The public shape is unchanged so
 * ProtectedRoute, LoginPage, OAuthCallback and all UI consumers keep working.
 * A `user` is only ever derived from the signed-in session's `profiles` row.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailConnected: boolean;
  connectedEmailAddress?: string;
  lastSyncedAt?: string;
  role: string;
  profile: Profile | null;
  resumeUploaded: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isConnectingEmail: boolean;
  loginError: string | null;
  signupError: string | null;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  connectEmail: (email: string) => Promise<void>;
  disconnectEmail: () => Promise<void>;
  syncEmailTasks: () => Promise<number>;
  updateProfile: (profile: Profile) => Promise<void>;
  clearErrors: () => void;
}

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: string;
  connected_email: string | null;
  email_connected: boolean;
  last_synced_at: string | null;
  profile: Profile | null;
  created_at: string;
}

function toAuthUser(row: ProfileRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailConnected: row.email_connected,
    connectedEmailAddress: row.connected_email ?? undefined,
    lastSyncedAt: row.last_synced_at ?? undefined,
    role: row.role,
    profile: row.profile,
    resumeUploaded: !!row.profile,
    createdAt: row.created_at,
  };
}

/** Fetch (and lazily create if the signup trigger hasn't run) the profile row. */
async function fetchProfileRow(uid: string): Promise<ProfileRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as ProfileRow;

  const meta = supabase.auth.getUser().then((r) => r.data.user).catch(() => null);
  const user = await meta;
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: uid,
      email: user?.email ?? '',
      name: (user?.user_metadata?.name as string) ?? user?.email?.split('@')[0] ?? '',
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return created as ProfileRow;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Keep the store in sync with the Supabase session lifecycle.
  const { data: sub } = getSupabase().auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, isAuthenticated: false });
      return;
    }
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      const session = getSupabase().auth.getSession().then((s) => s.data.session).catch(() => null);
      const uid = (await session)?.user?.id;
      if (uid) {
        try {
          const row = await fetchProfileRow(uid);
          set({ user: row ? toAuthUser(row) : null, isAuthenticated: !!row });
        } catch {
          /* ignore transient failures; retried on next event */
        }
      }
    }
  });
  void sub;

  return {
    user: null,
    isAuthenticated: false,
    isAuthModalOpen: false,
    isConnectingEmail: false,
    loginError: null,
    signupError: null,

    setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

    login: async (email, password) => {
      set({ loginError: null });
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        set({ loginError: error?.message || 'Login failed. Please try again.' });
        return false;
      }
      const uid = data.session.user.id;
      try {
        const row = await fetchProfileRow(uid);
        set({ user: row ? toAuthUser(row) : null, isAuthenticated: !!row, isAuthModalOpen: false, loginError: null });
        return !!row;
      } catch {
        set({ loginError: 'Signed in, but could not load your profile.' });
        return false;
      }
    },

    signup: async (email, name, password) => {
      set({ signupError: null });
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin },
      });
      if (error) {
        set({ signupError: error.message });
        return false;
      }
      // Email confirmation is required — the account is created but the session
      // starts after the user clicks the confirmation link.
      set({ isAuthModalOpen: false, signupError: null });
      useUIStore
        .getState()
        .toast({
          title: 'Check your email',
          description: 'Confirm your account to sign in.',
          variant: 'info',
        });
      return true;
    },

    logout: async () => {
      await getSupabase().auth.signOut();
      set({ user: null, isAuthenticated: false });
    },

    connectEmail: async (email) => {
      const currentUser = get().user;
      if (!currentUser) return;
      set({ isConnectingEmail: true });
      const { error } = await getSupabase()
        .from('profiles')
        .update({ connected_email: email, email_connected: true })
        .eq('id', currentUser.id);
      set({ isConnectingEmail: false });
      if (!error) {
        set({ user: { ...currentUser, emailConnected: true, connectedEmailAddress: email } });
      }
    },

    disconnectEmail: async () => {
      const currentUser = get().user;
      if (!currentUser) return;
      const { error } = await getSupabase()
        .from('profiles')
        .update({ connected_email: null, email_connected: false })
        .eq('id', currentUser.id);
      if (!error) {
        set({ user: { ...currentUser, emailConnected: false, connectedEmailAddress: undefined } });
      }
    },

    syncEmailTasks: async () => {
      const currentUser = get().user;
      const { extractTasksFromEmails } = await import('../services/emailTaskService');

      let created = 0;
      try {
        const extracted = await extractTasksFromEmails({ useInbox: true, maxEmails: 20 });
        for (const t of extracted) {
          await useTaskStore.getState().addTask({
            title: t.title,
            description: t.description,
            priority: t.priority,
            category: t.category,
            estimatedMinutes: t.estimatedMinutes,
            actualMinutes: null,
            deadline: t.deadline ?? null,
            recurrence: null,
            tags: ['email'],
            source: 'ai',
            linkedJobId: null,
            linkedCourseId: null,
          });
          created++;
        }
        if (created > 0) {
          useUIStore
            .getState()
            .toast({
              title: 'Email sync complete',
              description: `Created ${created} task${created === 1 ? '' : 's'} from your inbox.`,
              variant: 'success',
            });
        }
      } catch (e) {
        console.warn('Email sync failed:', e);
      }

      if (currentUser) {
        const now = new Date().toISOString();
        const { error } = await getSupabase()
          .from('profiles')
          .update({ last_synced_at: now })
          .eq('id', currentUser.id);
        if (!error) {
          set({ user: { ...currentUser, lastSyncedAt: now } });
        }
      }
      return created;
    },

    updateProfile: async (profile) => {
      const currentUser = get().user;
      if (!currentUser) return;
      const { error } = await getSupabase()
        .from('profiles')
        .update({ profile })
        .eq('id', currentUser.id);
      if (!error) {
        set({ user: { ...currentUser, profile, resumeUploaded: true } });
      }
    },

    clearErrors: () => set({ loginError: null, signupError: null }),
  };
});