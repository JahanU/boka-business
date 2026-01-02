import { supabase } from '@/config/supabaseClient';
import type { StaffAvailability, AvailabilityFormData } from '@/types';

export const availabilityService = {
	async getByStaffId(staffId: string): Promise<StaffAvailability[]> {
		const { data, error } = await supabase
			.from('staff_availability')
			.select('*')
			.eq('staff_id', staffId)
			.order('day_of_week', { ascending: true })
			.order('start_time', { ascending: true });

		if (error) {
			console.error('Error fetching availability:', error);
			return [];
		}

		return data || [];
	},

	async create(staffId: string, formData: AvailabilityFormData): Promise<StaffAvailability | null> {
		const { data, error } = await supabase
			.from('staff_availability')
			.insert({
				staff_id: staffId,
				...formData,
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating availability:', error);
			return null;
		}

		return data;
	},

	async update(id: string, updates: Partial<AvailabilityFormData>): Promise<StaffAvailability | null> {
		const { data, error } = await supabase
			.from('staff_availability')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating availability:', error);
			return null;
		}

		return data;
	},

	async delete(id: string): Promise<boolean> {
		const { error } = await supabase
			.from('staff_availability')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting availability:', error);
			return false;
		}

		return true;
	},

	// Validate that a new availability entry doesn't conflict with existing ones
	async validateNoConflict(
		staffId: string,
		dayOfWeek: number | undefined,
		specificDate: string | undefined,
		startTime?: string,
		endTime?: string,
		excludeId?: string
	): Promise<boolean> {
		let query = supabase
			.from('staff_availability')
			.select('*')
			.eq('staff_id', staffId);

		if (dayOfWeek !== undefined) {
			query = query.eq('day_of_week', dayOfWeek);
		}

		if (specificDate) {
			query = query.eq('specific_date', specificDate);
		}

		if (excludeId) {
			query = query.neq('id', excludeId);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error validating availability:', error);
			return false;
		}

		// Only check working_hours conflicts if times are provided
		if (startTime && endTime) {
			const hasConflict = data?.some((existing: StaffAvailability) => {
				if (existing.availability_type !== 'working_hours') return false;

				const existingStart = existing.start_time;
				const existingEnd = existing.end_time;

				if (!existingStart || !existingEnd) return false;

				return (
					(startTime >= existingStart && startTime < existingEnd) ||
					(endTime > existingStart && endTime <= existingEnd) ||
					(startTime <= existingStart && endTime >= existingEnd)
				);
			});
			return !hasConflict;
		}

		return true;
	},
};
