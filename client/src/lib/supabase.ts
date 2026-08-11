import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gebuwptfhxhnhogdrxoh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlYnV3cHRmaHhoaG5ob2dkcnhvaCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUyODg0NzQ4LCJleHAiOjIwNjg0NjA3NDh9.6zKz3bMZx4u5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
