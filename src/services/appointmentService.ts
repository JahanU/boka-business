import { supabase } from '@/config/supabaseClient';
import type { Appointment } from '@/types';

export const appointmentService = {
	async getByBusinessId(businessId: string): Promise<Appointment[]> {
		const { data, error } = await supabase
			.from('appointments')
			.select('*')
			.eq('business_id', businessId)
			.order('appointment_date', { ascending: true })
			.order('appointment_time', { ascending: true });

		if (error) {
			console.error('Error fetching appointments by business:', error);
			return [];
		}

		return data || [];
	},

	async delete(id: string): Promise<boolean> {
		const { error } = await supabase
			.from('appointments')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting appointment:', error);
			return false;
		}

		return true;
	}
};
