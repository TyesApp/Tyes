import { createHmac, timingSafeEqual } from 'crypto';
import { createClient as createServiceClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

export const ADMIN_ROLES = ['admin', 'superAdmin', 'super_admin'];

let _service: SupabaseClient | null = null;
/** Supabase client with the service-role key (server only, bypasses RLS). */
export function serviceClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  if (!_service) _service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, key);
  return _service;
}

/** Admin status comes ONLY from profiles.role (never from user-editable user_metadata). */
export async function isAdminUser(userId: string): Promise<boolean> {
  const { data } = await serviceClient().from('profiles').select('role').eq('id', userId).maybeSingle();
  return ADMIN_ROLES.includes(data?.role);
}

/** Returns the signed-in user from the request cookies, or null. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/** Returns the signed-in admin user, or null if not signed in / not an admin. */
export async function getAdminUser(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await isAdminUser(user.id)) ? user : null;
}

// ── Custom-quote signatures: only prices set by an admin can be charged for Custom / Deep Dive orders ──
function quoteSecret() {
  const s = process.env.QUOTE_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('No signing secret configured');
  return s;
}
export function signQuote(orderId: string, amount: number): string {
  return createHmac('sha256', quoteSecret()).update(`${orderId}:${Number(amount).toFixed(2)}`).digest('hex');
}
export function verifyQuote(orderId: string, amount: number, sig: unknown): boolean {
  if (typeof sig !== 'string' || !sig) return false;
  const expected = Buffer.from(signQuote(orderId, amount));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function isCustomOrder(o: { plan?: string | null; is_custom?: boolean | null }): boolean {
  return Boolean(o?.plan?.includes('Custom') || o?.is_custom || o?.plan?.includes('Deep Dive'));
}
