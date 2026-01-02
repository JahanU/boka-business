import { supabase } from '@/config/supabaseClient';
import type { Staff } from '@/types';

export const staffService = {
	async getByUserId(userId: string): Promise<Staff | null> {
		const { data, error } = await supabase
			.from('staff')
			.select('*')
			.eq('user_id', userId)
			.single();

		if (error) {
			console.error('Error fetching staff by user_id:', error);
			return null;
		}

		return data;
	},
};
