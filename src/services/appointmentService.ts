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

	async cancel(appointment: Appointment, staffEmail: string): Promise<boolean> {
		// 1. If there's a Google Event ID, call the Netlify function to delete it
		if (appointment.google_event_id) {
			try {
				const response = await fetch('/.netlify/functions/cancel-google-bookings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						eventId: appointment.google_event_id,
						customerEmail: appointment.customer_email,
						customerName: appointment.customer_name,
						serviceName: appointment.service_name,
						appointmentDate: appointment.appointment_date,
						staffEmail,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					console.error('Failed to cancel Google Calendar event:', errorData);
					// We continue even if Google cancellation fails, or we could bail here
				}
			} catch (error) {
				console.error('Error calling cancel-google-bookings function:', error);
			}
		}

		// 2. Delete the appointment from Supabase
		return this.delete(appointment.id);
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
