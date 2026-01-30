import { createClient } from '@supabase/supabase-js';
import { config } from './index';

// Client for server-side operations with service role (bypasses RLS)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client for user-context operations (respects RLS)
export const createSupabaseClient = (accessToken?: string) => {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      },
    }
  );
};

export default supabaseAdmin;
