import { createClient } from '@supabase/supabase-js';

// Mirrors window.BrainHubConfig.supabase from config.js so the
// dashboards use the same project as the rest of the site.
const SUPABASE_URL = 'https://pdkslovwbbytfexguteo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_klXl7mVNAefz2aC-UfCQ2w_E0r7PP1h';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
