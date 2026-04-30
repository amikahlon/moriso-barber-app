import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseProjectRef = new URL(supabaseUrl).hostname.split(".")[0];
const supabaseAuthStorageKey = `sb-${supabaseProjectRef}-auth-token`;

export const clearStoredSupabaseSession = async () => {
  await Promise.all([
    AsyncStorage.removeItem(supabaseAuthStorageKey),
    AsyncStorage.removeItem(`${supabaseAuthStorageKey}-code-verifier`),
    AsyncStorage.removeItem(`${supabaseAuthStorageKey}-user`),
  ]);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    storageKey: supabaseAuthStorageKey,
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
