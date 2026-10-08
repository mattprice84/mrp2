import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

/**
 * Public project settings. The publishable key is designed to ship inside the
 * app: it can only do what row-level security allows. The service-role key
 * never goes in the app or this repository.
 */
const SUPABASE_URL = 'https://hivbxlhsejkutvdgmola.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EQfSR3D0mzN9ng7wP9wKRQ_Erf4Fswd';

/**
 * Keeps the sign-in session in the iOS Keychain (via SecureStore), readable
 * only after the phone has been unlocked once since restart. Keychain items
 * are size-limited, so long values are split into chunks.
 */
const CHUNK = 1800;
const keychain: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

const secureStorage = {
  async getItem(key: string) {
    const count = await SecureStore.getItemAsync(`${key}.n`, keychain);
    if (!count) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(count); i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`, keychain);
      if (part == null) return null;
      parts.push(part);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string) {
    await secureStorage.removeItem(key);
    const n = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK), keychain);
    }
    await SecureStore.setItemAsync(`${key}.n`, String(n), keychain);
  },
  async removeItem(key: string) {
    const count = await SecureStore.getItemAsync(`${key}.n`, keychain);
    await SecureStore.deleteItemAsync(`${key}.n`, keychain);
    for (let i = 0; i < Number(count ?? 0); i++) {
      await SecureStore.deleteItemAsync(`${key}.${i}`, keychain);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only refresh the session while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
