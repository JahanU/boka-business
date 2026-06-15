import { getSupabase } from '../supabase.js';
import type { Business } from '../types/index.js';

export const businessService = {
	async getById(id: string): Promise<Business | null> {
		const { data, error } = await getSupabase()
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

	async create(business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business | null> {
		const { data, error } = await getSupabase()
			.from('businesses')
			.insert(business)
			.select()
			.single();

		if (error) {
			console.error('Error creating business:', error);
			return null;
		}

		return data;
	},

	async update(id: string, updates: Partial<Business>): Promise<Business | null> {
		const { data, error } = await getSupabase()
			.from('businesses')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating business:', error);
			return null;
		}

		return data;
	},
};
