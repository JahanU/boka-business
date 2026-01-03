import { vi, describe, it, expect, beforeEach } from 'vitest';
import { appointmentService } from '../appointmentService';
import { supabase } from '@/config/supabaseClient';
import { Appointment } from '@/types';

// Mock Supabase
vi.mock('@/config/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

describe('appointmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
    });

    describe('cancel', () => {
        const mockAppointment: Appointment = {
            id: 'app-1',
            business_id: 'biz-1',
            service_id: 'ser-1',
            service_name: 'Haircut',
            service_price: 30,
            payment_status: 'paid_online',
            staff_id: 'staff-1',
            google_event_id: 'google-1',
            customer_email: 'test@example.com',
            customer_name: 'Test Customer',
            appointment_date: '2026-01-01',
            appointment_time: '10:00:00',
            duration_minutes: 30,
            status: 'confirmed',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
        };

        it('calls netlify function when google_event_id exists', async () => {
            const mockFrom = vi.mocked(supabase.from);

            const mockStaffQuery = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { email: 'staff@example.com' }, error: null }),
            };

            const mockDeleteQuery = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            };

            mockFrom.mockImplementation((table: string) => {
                if (table === 'staff') return mockStaffQuery as unknown as ReturnType<typeof supabase.from>;
                return mockDeleteQuery as unknown as ReturnType<typeof supabase.from>;
            });

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            } as Response);

            const result = await appointmentService.cancel(mockAppointment);

            expect(fetch).toHaveBeenCalledWith('/.netlify/functions/cancel-google-bookings', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('staff@example.com'),
            }));
            expect(result).toBe(true);
        });

        it('only calls delete when google_event_id is missing', async () => {
            const mockFrom = vi.mocked(supabase.from);
            const mockDeleteQuery = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            };
            mockFrom.mockReturnValue(mockDeleteQuery as unknown as ReturnType<typeof supabase.from>);

            const result = await appointmentService.cancel({ ...mockAppointment, google_event_id: undefined });

            expect(result).toBe(true);
            expect(fetch).not.toHaveBeenCalled();
            expect(mockDeleteQuery.delete).toHaveBeenCalled();
        });

        it('continues to delete appointment even if fetch fails', async () => {
            const mockFrom = vi.mocked(supabase.from);
            const mockStaffQuery = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { email: 'staff@example.com' }, error: null }),
            };
            const mockDeleteQuery = {
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null }),
            };

            mockFrom.mockImplementation((table: string) => {
                if (table === 'staff') return mockStaffQuery as unknown as ReturnType<typeof supabase.from>;
                return mockDeleteQuery as unknown as ReturnType<typeof supabase.from>;
            });

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Internal Server Error' }),
            } as Response);

            const result = await appointmentService.cancel(mockAppointment);

            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalled();
            expect(mockDeleteQuery.delete).toHaveBeenCalled();
        });
    });
});
