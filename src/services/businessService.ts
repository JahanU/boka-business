import { supabase } from '@/config/supabaseClient';
import type { Business } from '@/types';

export const businessService = {
	async getById(id: string): Promise<Business | null> {
		const { data, error } = await supabase
			.from('businesses')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching business:', error);
			return null;
		}

		return data;
	},
};
