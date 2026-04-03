/**
 * lib/db/index.ts — Database client barrel
 *
 * Import from '@/lib/db' to access the Supabase admin client (server-side).
 * For browser use, import from '@/lib/db/supabase-browser'.
 * For middleware, import from '@/lib/db/supabase-middleware'.
 */
export { supabaseAdmin } from './supabase-server'
