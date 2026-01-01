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

	async getByStaffId(staffId: string): Promise<Appointment[]> {
		const { data, error } = await supabase
			.from('appointments')
			.select('*')
			.eq('staff_id', staffId)
			.order('appointment_date', { ascending: true })
			.order('appointment_time', { ascending: true });

		if (error) {
			console.error('Error fetching appointments by staff:', error);
			return [];
		}

		return data || [];
	},

	async updateStatus(id: string, status: Appointment['status']): Promise<boolean> {
		const { error } = await supabase
			.from('appointments')
			.update({ status, updated_at: new Date().toISOString() })
			.eq('id', id);

		if (error) {
			console.error('Error updating appointment status:', error);
			return false;
		}

		return true;
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
