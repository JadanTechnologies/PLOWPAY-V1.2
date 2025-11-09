import { createClient } from '@supabase/supabase-js';

// The user-facing environment variables are prefixed with VITE_
// These are placeholders and should be replaced in a .env file.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might show a graceful error page.
  // For this environment, we'll throw to make it clear setup is needed.
  throw new Error('Supabase URL and/or Anon Key are missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
