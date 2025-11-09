import { createClient } from '@supabase/supabase-js';

// The user-facing environment variables are prefixed with VITE_
// These should be replaced with actual credentials in a .env file for local development.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTA1ODV9.h0LzP_j5sZl14S_Y6o9Q3sbcmfm2s_d0V4Y_l-aI7KU';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTA1ODV9.h0LzP_j5sZl14S_Y6o9Q3sbcmfm2s_d0V4Y_l-aI7KU') {
  // In a real app, you might show a graceful error page or a setup guide.
  // For this environment, we'll log a warning to the console.
  console.warn('Supabase URL and/or Anon Key are not set. Using placeholder values. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables for the app to function correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);