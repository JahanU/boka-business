import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookingsPage from '../Bookings';
import { Appointment } from '@/types';

const mockUseAuth = vi.fn();
const mockGetByBusinessId = vi.fn();
const mockCancel = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/appointmentService', () => ({
	appointmentService: {
		getByBusinessId: (...args: unknown[]) => mockGetByBusinessId(...args),
		cancel: (...args: unknown[]) => mockCancel(...args),
	},
}));

const mockBookings: Appointment[] = [
	{
		id: 'booking-1',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'Upcoming John',
		appointment_date: '2026-01-05',
		appointment_time: '10:00:00',
		service_name: 'Haircut',
		service_price: 30,
		payment_status: 'paid_online',
		status: 'confirmed',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	} as Appointment,
	{
		id: 'booking-2',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'Today Past Jane',
		appointment_date: '2026-01-04',
		appointment_time: '13:00:00',
		service_name: 'Beard Trim',
		service_price: 20,
		payment_status: 'paid_online',
		status: 'pending_payment',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	} as Appointment,
	{
		id: 'booking-3',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'Today Future Bob',
		appointment_date: '2026-01-04',
		appointment_time: '16:00:00',
		service_name: 'Coloring',
		service_price: 50,
		payment_status: 'paid_online',
		status: 'confirmed',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	} as Appointment,
];

describe('BookingsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers({ toFake: ['Date'] });
		// Use a local string without 'Z' to mock local time parsing correctly
		vi.setSystemTime(new Date('2026-01-04T15:00:00'));
		mockGetByBusinessId.mockResolvedValue([]);
		mockCancel.mockResolvedValue(true);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows loading state initially', () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockImplementation(() => new Promise(() => { })); // Never resolves

		render(<BookingsPage />);

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('renders the bookings page header', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('Bookings')).toBeInTheDocument();
		});
		expect(screen.getByText('Manage your upcoming appointments and history.')).toBeInTheDocument();
	});

	it('shows empty states for upcoming, past, and cancelled tabs', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue([]);
		const user = userEvent.setup({ delay: null });

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('No upcoming bookings found')).toBeInTheDocument();
		});

		const pastTab = screen.getByRole('tab', { name: /past/i });
		await user.click(pastTab);
		expect(screen.getByText('No past bookings found')).toBeInTheDocument();

		const cancelledTab = screen.getByRole('tab', { name: /cancelled/i });
		await user.click(cancelledTab);
		expect(screen.getByText('No cancelled bookings found')).toBeInTheDocument();
	});

	it('categorizes appointments correctly into Upcoming, Past, and Cancelled tabs', async () => {
		const bookingsWithCancelled = [
			...mockBookings,
			{ ...mockBookings[0], id: 'booking-4', customer_name: 'Cancelled Carl', status: 'cancelled' } as Appointment
		];
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue(bookingsWithCancelled);
		const user = userEvent.setup({ delay: null });

		render(<BookingsPage />);

		await waitFor(() => {
			// Upcoming tab should show Today Future Bob and Upcoming John
			expect(screen.getByText('Today Future Bob')).toBeInTheDocument();
			expect(screen.getByText('Upcoming John')).toBeInTheDocument();
			expect(screen.queryByText('Today Past Jane')).not.toBeInTheDocument();
			expect(screen.queryByText('Cancelled Carl')).not.toBeInTheDocument();
		});

		const pastTab = screen.getByRole('tab', { name: /past/i });
		await user.click(pastTab);

		// Past tab should show Today Past Jane
		expect(screen.getByText('Today Past Jane')).toBeInTheDocument();
		expect(screen.queryByText('Today Future Bob')).not.toBeInTheDocument();

		const cancelledTab = screen.getByRole('tab', { name: /cancelled/i });
		await user.click(cancelledTab);

		// Cancelled tab should show Cancelled Carl
		expect(screen.getByText('Cancelled Carl')).toBeInTheDocument();
		expect(screen.queryByText('Upcoming John')).not.toBeInTheDocument();
	});

	it('sorts upcoming appointments by date ascending', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			const names = screen.getAllByText(/Today Future Bob|Upcoming John/).map(el => el.textContent);
			expect(names).toEqual(['Today Future Bob', 'Upcoming John']);
		});
	});

	it('sorts past appointments by date descending', async () => {
		const manyPastBookings = [
			{ ...mockBookings[1], id: 'old-1', customer_name: 'Oldest', appointment_date: '2026-01-01' },
			{ ...mockBookings[1], id: 'old-2', customer_name: 'Newer Past', appointment_date: '2026-01-03' },
		];
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue(manyPastBookings);
		const user = userEvent.setup({ delay: null });

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.queryByRole('status')).not.toBeInTheDocument();
		});

		const pastTab = screen.getByRole('tab', { name: /past/i });
		await user.click(pastTab);

		await waitFor(() => {
			const names = screen.getAllByText(/Oldest|Newer Past/).map(el => el.textContent);
			expect(names).toEqual(['Newer Past', 'Oldest']);
		});
	});

	it('shows no delete button for past appointments', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		const user = userEvent.setup({ delay: null });

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.queryByRole('status')).not.toBeInTheDocument();
		});

		const pastTab = screen.getByRole('tab', { name: /past/i });
		await user.click(pastTab);

		// The trash icon is inside a button, but there should be no buttons for past bookings now
		const deleteButtons = screen.queryAllByRole('button').filter(
			(btn) => btn.querySelector('svg')
		);
		expect(deleteButtons).toHaveLength(0);
	});

	it('fetches bookings for the business on mount', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(mockGetByBusinessId).toHaveBeenCalledWith('biz-123');
		});
	});

	it('calls cancel service when cancel button is clicked and confirmed', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' }, staff: { email: 'staff@test.com' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const user = userEvent.setup({ delay: null });

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('Upcoming John')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByRole('button');
		const trashButtons = deleteButtons.filter(
			(btn) => btn.querySelector('svg') && !btn.textContent?.trim()
		);

		await user.click(trashButtons[0]);

		await waitFor(() => {
			expect(confirmSpy).toHaveBeenCalled();
			expect(mockCancel).toHaveBeenCalled();
		});

		confirmSpy.mockRestore();
	});
});
