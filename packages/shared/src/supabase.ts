import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

interface SupabaseConfig {
	url: string;
	anonKey: string;
}

let supabase: SupabaseClient | null = null;

export function initSharedSupabase(
	config: SupabaseConfig,
	options?: SupabaseClientOptions<'public'>
): SupabaseClient {
	if (!supabase) {
		supabase = createClient(config.url, config.anonKey, options);
	}
	return supabase;
}

export function getSupabase(): SupabaseClient {
	if (!supabase) {
		throw new Error('Supabase client has not been initialized. Call initSharedSupabase(...) first.');
	}
	return supabase;
}

export { supabase };
