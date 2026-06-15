import { initSharedSupabase } from '@boka/shared/supabase';
import { secureStorage } from '@/lib/secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = initSharedSupabase(
	{ url: supabaseUrl, anonKey: supabaseAnonKey },
	{
		auth: {
			storage: secureStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	}
);
