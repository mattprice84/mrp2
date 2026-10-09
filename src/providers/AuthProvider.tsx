import type { Session } from '@supabase/supabase-js';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import type { Role } from '@/theme';

export type Profile = { id: string; display_name: string | null; role: Role | null };
export type Couple = { id: string; wedding_date: string | null; sealed_at: string | null };

type AuthState = {
  loading: boolean;
  session: Session | null;
  me: Profile | null;
  spouse: Profile | null;
  couple: Couple | null;
  /** Both spouses have joined; the app's main tabs are available. */
  paired: boolean;
  /** First name Apple shared at sign-in, used to pre-fill pairing. */
  appleGivenName: string | null;
  setAppleGivenName: (name: string | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  // Which user's data is currently loaded (null = signed out).
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(undefined);
  const [me, setMe] = useState<Profile | null>(null);
  const [spouse, setSpouse] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [appleGivenName, setAppleGivenName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const refresh = useCallback(async () => {
    if (!userId) {
      setMe(null);
      setSpouse(null);
      setCouple(null);
      setLoadedFor(null);
      return;
    }
    // Row-level security limits these to my own rows and my spouse's.
    const [profiles, couples] = await Promise.all([
      supabase.from('profiles').select('id, display_name, role'),
      supabase.from('couples').select('id, wedding_date, sealed_at').maybeSingle(),
    ]);
    if (profiles.error || couples.error) {
      // Keep whatever we had; a later refresh will try again.
      setLoadedFor(userId);
      return;
    }
    const rows = (profiles.data ?? []) as Profile[];
    setMe(rows.find((p) => p.id === userId) ?? null);
    setSpouse(rows.find((p) => p.id !== userId) ?? null);
    setCouple((couples.data as Couple | null) ?? null);
    setLoadedFor(userId);
  }, [userId]);

  useEffect(() => {
    if (sessionLoaded) Promise.resolve().then(refresh);
  }, [sessionLoaded, refresh]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading: !sessionLoaded || loadedFor !== userId,
      session,
      me,
      spouse,
      couple,
      paired: !!couple?.sealed_at && !!spouse,
      appleGivenName,
      setAppleGivenName,
      refresh,
      signOut,
    }),
    [sessionLoaded, loadedFor, userId, session, me, spouse, couple, appleGivenName, refresh, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
