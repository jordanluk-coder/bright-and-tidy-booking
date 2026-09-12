import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * True when the env file still holds the placeholder values from the README.
 * The app renders a friendly setup notice instead of failing silently.
 */
export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  typeof supabaseAnonKey === 'string' &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('PASTE_YOUR') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('PASTE_YOUR')

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Add them to .env.local (see .env.example) and restart the dev server.',
  )
}

/**
 * Single shared Supabase client.
 * Uses the official browser defaults: the session is persisted in localStorage,
 * tokens auto-refresh, and nothing here ever clears the session manually.
 */
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
