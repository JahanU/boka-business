import { supabase } from '@/config/supabaseClient';
import type { Staff } from '@/types';

export const staffService = {
	async getByUserId(userId: string): Promise<Staff | null> {
		const { data, error } = await supabase
			.from('staff')
			.select('*, businesses(*)')
			.eq('user_id', userId)
			.single();
		if (error) {
			console.error('Error fetching staff by user_id:', error);
			return null;
		}

		return data;
	},

	async getById(id: string): Promise<Staff | null> {
		const { data, error } = await supabase
			.from('staff')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching staff:', error);
			return null;
		}

		return data;
	},

	async getByBusinessId(businessId: string): Promise<Staff[]> {
		const { data, error } = await supabase
			.from('staff')
			.select('*')
			.eq('business_id', businessId);

		if (error) {
			console.error('Error fetching staff by business_id:', error);
			return [];
		}

		return data || [];
	},

	async create(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff | null> {
		const { data, error } = await supabase
			.from('staff')
			.insert(staff)
			.select()
			.single();

		if (error) {
			console.error('Error creating staff:', error);
			return null;
		}

		return data;
	},

	async update(id: string, updates: Partial<Staff>): Promise<Staff | null> {
		const { data, error } = await supabase
			.from('staff')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating staff:', error);
			return null;
		}

		return data;
	},
};
