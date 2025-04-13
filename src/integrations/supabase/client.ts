
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rpfrftyvajwftzlnwmlf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZnJmdHl2YWp3ZnR6bG53bWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NDkwMzksImV4cCI6MjA2MDEyNTAzOX0.Qrw0oH2yWtFPW_lS5diOyrQVocnXNWNgWeyKEkPbk0w";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
