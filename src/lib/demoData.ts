import { addDays, formatISO, startOfDay } from 'date-fns';
import type { Appointment, Business, Staff, StaffAvailability } from '@/types';

export const DEMO_BUSINESS_ID = 'demo-business-boka-barber';
export const DEMO_STAFF_ID = 'demo-staff-boka-barber';
export const DEMO_USER_ID = 'demo-user-boka-barber';

const now = new Date();
const today = startOfDay(now);

export const demoBusiness: Business = {
	id: DEMO_BUSINESS_ID,
	name: 'Boka Barber',
	email: 'demo@bokabarber.com',
	phone: '+44 20 7946 0958',
	address: '123 Barber Street, London',
	created_at: '2026-01-01T00:00:00.000Z',
	updated_at: '2026-01-01T00:00:00.000Z',
};

export const demoStaff: Staff = {
	id: DEMO_STAFF_ID,
	business_id: DEMO_BUSINESS_ID,
	user_id: DEMO_USER_ID,
	email: 'demo@bokabarber.com',
	name: 'Demo Barber',
	role: 'owner',
	created_at: '2026-01-01T00:00:00.000Z',
	updated_at: '2026-01-01T00:00:00.000Z',
	businesses: demoBusiness,
};

export const demoWorkingHours: StaffAvailability[] = [
	{ id: 'demo-wh-0', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 0, start_time: '09:00', end_time: '17:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
	{ id: 'demo-wh-1', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
	{ id: 'demo-wh-2', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
	{ id: 'demo-wh-3', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
	{ id: 'demo-wh-4', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
	{ id: 'demo-wh-5', staff_id: DEMO_STAFF_ID, availability_type: 'working_hours', day_of_week: 5, start_time: '10:00', end_time: '16:00', is_recurring: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
];

export const demoAnnualLeave: StaffAvailability[] = [
	{
		id: 'demo-al-1',
		staff_id: DEMO_STAFF_ID,
		availability_type: 'annual_leave',
		specific_date: formatISO(addDays(today, -3), { representation: 'date' }),
		end_date: formatISO(addDays(today, -3), { representation: 'date' }),
		is_recurring: false,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-01T00:00:00.000Z',
	},
	{
		id: 'demo-al-2',
		staff_id: DEMO_STAFF_ID,
		availability_type: 'annual_leave',
		specific_date: formatISO(addDays(today, 14), { representation: 'date' }),
		end_date: formatISO(addDays(today, 16), { representation: 'date' }),
		is_recurring: false,
		created_at: '2026-01-01T00:00:00.000Z',
		updated_at: '2026-01-01T00:00:00.000Z',
	},
];

type DemoAppointmentSeed = Omit<Appointment, 'id' | 'appointment_date' | 'appointment_time' | 'created_at' | 'updated_at' | 'business_id' | 'staff_id'> & {
	dayOffset: number;
	time: string;
};

const demoAppointmentsSeed: DemoAppointmentSeed[] = [
	// Today
	{ dayOffset: 0, time: '09:30', customer_name: 'James Smith', customer_email: 'james@example.com', customer_phone: '07700 900001', service_id: 'svc-skin-fade', service_name: 'Skin Fade', service_price: 25, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 30, notes: '' },
	{ dayOffset: 0, time: '11:00', customer_name: 'Oliver Brown', customer_email: 'oliver@example.com', customer_phone: '07700 900002', service_id: 'svc-beard-trim', service_name: 'Beard Trim', service_price: 15, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 20, notes: '' },
	{ dayOffset: 0, time: '14:00', customer_name: 'Harry Wilson', customer_email: 'harry@example.com', customer_phone: '07700 900003', service_id: 'svc-haircut-beard', service_name: 'Haircut & Beard', service_price: 35, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 45, notes: '' },
	{ dayOffset: 0, time: '16:00', customer_name: 'Charlie Davis', customer_email: 'charlie@example.com', customer_phone: '07700 900004', service_id: 'svc-restyle', service_name: 'Restyle', service_price: 40, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 60, notes: '' },

	// Tomorrow
	{ dayOffset: 1, time: '10:00', customer_name: 'Noah Miller', customer_email: 'noah@example.com', customer_phone: '07700 900005', service_id: 'svc-skin-fade', service_name: 'Skin Fade', service_price: 25, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 30, notes: '' },
	{ dayOffset: 1, time: '13:30', customer_name: 'Liam Taylor', customer_email: 'liam@example.com', customer_phone: '07700 900006', service_id: 'svc-senior-cut', service_name: 'Senior Cut', service_price: 18, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 30, notes: '' },
	{ dayOffset: 1, time: '09:00', customer_name: 'Liam Taylor', customer_email: 'liam@example.com', customer_phone: '07700 900006', service_id: 'svc-beard-trim', service_name: 'Beard Trim', service_price: 15, payment_status: 'paid_online', status: 'cancelled', duration_minutes: 20, notes: '' },

	// Day after tomorrow
	{ dayOffset: 2, time: '09:00', customer_name: 'James Smith', customer_email: 'james@example.com', customer_phone: '07700 900001', service_id: 'svc-beard-trim', service_name: 'Beard Trim', service_price: 15, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 20, notes: '' },
	{ dayOffset: 2, time: '15:00', customer_name: 'Oliver Brown', customer_email: 'oliver@example.com', customer_phone: '07700 900002', service_id: 'svc-haircut-beard', service_name: 'Haircut & Beard', service_price: 35, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 45, notes: '' },

	// Three days out
	{ dayOffset: 3, time: '11:30', customer_name: 'Harry Wilson', customer_email: 'harry@example.com', customer_phone: '07700 900003', service_id: 'svc-skin-fade', service_name: 'Skin Fade', service_price: 25, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 30, notes: '' },

	// Four days out
	{ dayOffset: 4, time: '10:00', customer_name: 'Charlie Davis', customer_email: 'charlie@example.com', customer_phone: '07700 900004', service_id: 'svc-restyle', service_name: 'Restyle', service_price: 40, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 60, notes: '' },

	// Five days out
	{ dayOffset: 5, time: '14:00', customer_name: 'Noah Miller', customer_email: 'noah@example.com', customer_phone: '07700 900005', service_id: 'svc-senior-cut', service_name: 'Senior Cut', service_price: 18, payment_status: 'paid_online', status: 'confirmed', duration_minutes: 30, notes: '' },

	// Yesterday
	{ dayOffset: -1, time: '10:00', customer_name: 'Liam Taylor', customer_email: 'liam@example.com', customer_phone: '07700 900006', service_id: 'svc-skin-fade', service_name: 'Skin Fade', service_price: 25, payment_status: 'paid_online', status: 'completed', duration_minutes: 30, notes: '' },
	{ dayOffset: -1, time: '16:00', customer_name: 'James Smith', customer_email: 'james@example.com', customer_phone: '07700 900001', service_id: 'svc-beard-trim', service_name: 'Beard Trim', service_price: 15, payment_status: 'paid_online', status: 'completed', duration_minutes: 20, notes: '' },

	// Two days ago
	{ dayOffset: -2, time: '11:00', customer_name: 'Oliver Brown', customer_email: 'oliver@example.com', customer_phone: '07700 900002', service_id: 'svc-haircut-beard', service_name: 'Haircut & Beard', service_price: 35, payment_status: 'paid_online', status: 'completed', duration_minutes: 45, notes: '' },
	{ dayOffset: -2, time: '14:30', customer_name: 'Harry Wilson', customer_email: 'harry@example.com', customer_phone: '07700 900003', service_id: 'svc-restyle', service_name: 'Restyle', service_price: 40, payment_status: 'paid_online', status: 'completed', duration_minutes: 60, notes: '' },
	{ dayOffset: -2, time: '12:00', customer_name: 'Noah Miller', customer_email: 'noah@example.com', customer_phone: '07700 900005', service_id: 'svc-skin-fade', service_name: 'Skin Fade', service_price: 25, payment_status: 'paid_online', status: 'cancelled', duration_minutes: 30, notes: '' },

	// Three days ago
	{ dayOffset: -3, time: '09:30', customer_name: 'Charlie Davis', customer_email: 'charlie@example.com', customer_phone: '07700 900004', service_id: 'svc-senior-cut', service_name: 'Senior Cut', service_price: 18, payment_status: 'paid_online', status: 'completed', duration_minutes: 30, notes: '' },
];

export function getDemoAppointments(): Appointment[] {
	return demoAppointmentsSeed.map((seed, index) => {
		const date = formatISO(addDays(today, seed.dayOffset), { representation: 'date' });
		return {
			...seed,
			id: `demo-appt-${index + 1}`,
			business_id: DEMO_BUSINESS_ID,
			staff_id: DEMO_STAFF_ID,
			appointment_date: date,
			appointment_time: `${seed.time}:00`,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z',
		};
	});
}

export function getDemoAvailability(): StaffAvailability[] {
	return [...demoWorkingHours, ...demoAnnualLeave];
}
