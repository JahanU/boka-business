import { getSupabase } from '../supabase.js';
import type { Appointment } from '../types/index.js';

export const appointmentService = {
	async getByBusinessId(businessId: string): Promise<Appointment[]> {
		const { data, error } = await getSupabase()
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
		const { data, error } = await getSupabase()
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
		const { error } = await getSupabase()
			.from('appointments')
			.update({ status, updated_at: new Date().toISOString() })
			.eq('id', id);

		if (error) {
			console.error('Error updating appointment status:', error);
			return false;
		}

		return true;
	},

	async cancel(
		appointment: Appointment,
		staffEmail: string,
		businessName: string,
		options?: { apiBaseUrl?: string }
	): Promise<boolean> {
		// 1. Send the cancellation email via the configured API
		try {
			const endpoint = options?.apiBaseUrl
				? `${options.apiBaseUrl.replace(/\/$/, '')}/cancel-booking`
				: '/.netlify/functions/cancel-booking';
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customerEmail: appointment.customer_email,
					customerName: appointment.customer_name,
					serviceName: appointment.service_name,
					appointmentDate: appointment.appointment_date,
					staffEmail,
					businessName,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Failed to send cancellation email:', errorData);
				// We continue even if email fails
			}
		} catch (error) {
			console.error('Error calling cancel-booking function:', error);
		}

		// 2. Update the appointment status to cancelled in Supabase
		return this.updateStatus(appointment.id, 'cancelled');
	},
};
