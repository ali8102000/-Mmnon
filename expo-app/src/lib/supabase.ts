import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const supabaseUrl = 'https://zvfdymcalzqhvwnipuup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZmR5bWNhbHpxaHZ3bmlwdXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzgxNzUsImV4cCI6MjA5Njc1NDE3NX0.eUgHgV8VMpemI32SA4V8dcgQtb-w6ahAiytOAsXU7e8';

const storageAdapter = Platform.OS === 'web' ? undefined : {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function authProxy<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${supabaseUrl}/functions/v1/auth-proxy${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || 'تعذر تنفيذ الطلب');
  return result as T;
}
