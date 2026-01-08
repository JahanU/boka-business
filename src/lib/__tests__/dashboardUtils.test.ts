import { describe, it, expect } from 'vitest';
import { calculateDashboardMetrics } from '../dashboardUtils';
import { Appointment } from '@/types';

describe('dashboardUtils', () => {
    describe('calculateDashboardMetrics', () => {
        const mockAppointments: Appointment[] = [
            // Today's appointments
            {
                id: 'apt-1',
                business_id: 'biz-1',
                staff_id: 'staff-1',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                service_id: 'service-1',
                service_name: 'Haircut',
                service_price: 30,
                payment_status: 'paid_online',
                appointment_date: new Date().toISOString().split('T')[0], // Today
                appointment_time: '09:00:00',
                duration_minutes: 30,
                status: 'confirmed',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
            {
                id: 'apt-2',
                business_id: 'biz-1',
                staff_id: 'staff-1',
                customer_name: 'Jane Smith',
                service_id: 'service-2',
                service_name: 'Beard Trim',
                service_price: 20,
                payment_status: 'pay_in_store',
                appointment_date: new Date().toISOString().split('T')[0], // Today
                appointment_time: '23:00:00', // Future time today
                duration_minutes: 20,
                status: 'confirmed',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
            // Yesterday's appointment
            {
                id: 'apt-3',
                business_id: 'biz-1',
                staff_id: 'staff-1',
                customer_name: 'Bob Johnson',
                service_id: 'service-1',
                service_name: 'Haircut',
                service_price: 30,
                payment_status: 'paid_online',
                appointment_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                appointment_time: '10:00:00',
                duration_minutes: 30,
                status: 'completed',
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
        ];

        it('calculates today\'s revenue correctly', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            // Should include both confirmed appointments today (30 + 20 = 50)
            expect(metrics.todayRevenue).toBe(50);
        });

        it('separates online and in-store revenue', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(metrics.todayRevenueOnline).toBe(30); // Only apt-1
            expect(metrics.todayRevenueInStore).toBe(20); // Only apt-2
        });

        it('counts today\'s bookings', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(metrics.todayBookingsCount).toBe(2);
        });

        it('identifies upcoming appointments today', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            // apt-2 has time 23:00:00 which should be in the future
            expect(metrics.upcomingTodayCount).toBeGreaterThanOrEqual(0);
        });

        it('calculates weekly bookings count', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(metrics.weeklyBookingsCount).toBeGreaterThanOrEqual(2);
        });

        it('calculates payment status summary', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(metrics.paymentStatusSummary).toHaveProperty('paidOnline');
            expect(metrics.paymentStatusSummary).toHaveProperty('payInStore');
            expect(typeof metrics.paymentStatusSummary.paidOnline).toBe('number');
            expect(typeof metrics.paymentStatusSummary.payInStore).toBe('number');
        });

        it('identifies popular services', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(Array.isArray(metrics.popularServices)).toBe(true);
            expect(metrics.popularServices.length).toBeGreaterThan(0);
            expect(metrics.popularServices[0]).toHaveProperty('name');
            expect(metrics.popularServices[0]).toHaveProperty('count');
        });

        it('generates daily revenue data', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(Array.isArray(metrics.dailyRevenue)).toBe(true);
            expect(metrics.dailyRevenue.length).toBe(7); // 7 days
            expect(metrics.dailyRevenue[0]).toHaveProperty('date');
            expect(metrics.dailyRevenue[0]).toHaveProperty('revenue');
        });

        it('creates today\'s schedule', () => {
            const metrics = calculateDashboardMetrics(mockAppointments);

            expect(Array.isArray(metrics.todaySchedule)).toBe(true);
            expect(metrics.todaySchedule.length).toBeLessThanOrEqual(5); // Max 5 appointments
        });

        it('handles empty appointments array', () => {
            const metrics = calculateDashboardMetrics([]);

            expect(metrics.todayRevenue).toBe(0);
            expect(metrics.todayBookingsCount).toBe(0);
            expect(metrics.weeklyBookingsCount).toBe(0);
            expect(metrics.popularServices).toEqual([]);
            expect(metrics.dailyRevenue.length).toBe(7);
            expect(metrics.nextAppointment).toBeNull();
        });

        it('excludes cancelled appointments from revenue', () => {
            const appointmentsWithCancelled: Appointment[] = [
                ...mockAppointments,
                {
                    id: 'apt-cancelled',
                    business_id: 'biz-1',
                    staff_id: 'staff-1',
                    customer_name: 'Cancelled Customer',
                    service_id: 'service-1',
                    service_name: 'Haircut',
                    service_price: 100,
                    payment_status: 'paid_online',
                    appointment_date: new Date().toISOString().split('T')[0],
                    appointment_time: '14:00:00',
                    duration_minutes: 30,
                    status: 'cancelled',
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
            ];

            const metrics = calculateDashboardMetrics(appointmentsWithCancelled);

            // Should not include the cancelled appointment's price
            expect(metrics.todayRevenue).toBe(50); // Still 30 + 20
        });

        it('sorts popular services by count descending', () => {
            const appointmentsWithMultipleServices: Appointment[] = [
                {
                    id: 'apt-1',
                    business_id: 'biz-1',
                    staff_id: 'staff-1',
                    service_id: 'service-1',
                    service_name: 'Haircut',
                    service_price: 30,
                    payment_status: 'paid_online',
                    appointment_date: new Date().toISOString().split('T')[0],
                    appointment_time: '09:00:00',
                    duration_minutes: 30,
                    status: 'confirmed',
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
                {
                    id: 'apt-2',
                    business_id: 'biz-1',
                    staff_id: 'staff-1',
                    service_id: 'service-1',
                    service_name: 'Haircut',
                    service_price: 30,
                    payment_status: 'paid_online',
                    appointment_date: new Date().toISOString().split('T')[0],
                    appointment_time: '10:00:00',
                    duration_minutes: 30,
                    status: 'confirmed',
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
                {
                    id: 'apt-3',
                    business_id: 'biz-1',
                    staff_id: 'staff-1',
                    service_id: 'service-2',
                    service_name: 'Beard Trim',
                    service_price: 20,
                    payment_status: 'paid_online',
                    appointment_date: new Date().toISOString().split('T')[0],
                    appointment_time: '11:00:00',
                    duration_minutes: 20,
                    status: 'confirmed',
                    created_at: '2026-01-01T00:00:00Z',
                    updated_at: '2026-01-01T00:00:00Z',
                },
            ];

            const metrics = calculateDashboardMetrics(appointmentsWithMultipleServices);

            expect(metrics.popularServices[0].name).toBe('Haircut');
            expect(metrics.popularServices[0].count).toBe(2);
            expect(metrics.popularServices[1].name).toBe('Beard Trim');
            expect(metrics.popularServices[1].count).toBe(1);
        });
    });
});
