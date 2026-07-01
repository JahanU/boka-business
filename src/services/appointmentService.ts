import { supabase } from '@/config/supabaseClient';
import { isDemoMode } from '@/lib/demo';
import { getDemoAppointments } from '@/lib/demoData';
import type { Appointment } from '@/types';

export const appointmentService = {
	async getByBusinessId(businessId: string): Promise<Appointment[]> {
		if (isDemoMode()) {
			return getDemoAppointments();
		}

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
		if (isDemoMode()) {
			return getDemoAppointments();
		}

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
		if (isDemoMode()) {
			return true;
		}

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

	async cancel(appointment: Appointment, staffEmail: string, businessName: string): Promise<boolean> {
		if (isDemoMode()) {
			return true;
		}

		// 1. Send the cancellation email via Netlify function
		try {
			const response = await fetch('/.netlify/functions/cancel-booking', {
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
