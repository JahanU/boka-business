import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookingsPage from '../Bookings';
import { Appointment } from '@/types';

const mockUseAuth = vi.fn();
const mockGetByBusinessId = vi.fn();
const mockCancel = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/appointmentService', () => ({
	appointmentService: {
		getByBusinessId: (...args: unknown[]) => mockGetByBusinessId(...args),
		cancel: (...args: unknown[]) => mockCancel(...args),
		delete: (...args: unknown[]) => mockDelete(...args),
	},
}));

const mockBookings: Appointment[] = [
	{
		id: 'booking-1',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'John Doe',
		customer_email: 'john@example.com',
		customer_phone: '555-1234',
		service_id: 'ser-1',
		service_name: 'Haircut',
		service_price: 30,
		payment_status: 'paid_online' as const,
		appointment_date: '2026-01-15',
		appointment_time: '10:00:00',
		duration_minutes: 30,
		status: 'confirmed' as const,
		notes: '',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
	{
		id: 'booking-2',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'Jane Smith',
		customer_email: 'jane@example.com',
		customer_phone: '123123123',
		service_id: 'ser-2',
		service_name: 'Beard Trim',
		service_price: 20,
		payment_status: 'pay_in_store' as const,
		appointment_date: '2026-01-16',
		appointment_time: '14:30:00',
		duration_minutes: 20,
		status: 'pending' as const,
		notes: '',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
];

describe('BookingsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetByBusinessId.mockResolvedValue([]);
		mockCancel.mockResolvedValue(true);
		mockDelete.mockResolvedValue(true);
	});

	it('shows loading state initially', () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockImplementation(() => new Promise(() => { })); // Never resolves

		render(<BookingsPage />);

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('renders the bookings page header', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('Bookings')).toBeInTheDocument();
		});
		expect(screen.getByText('Manage your upcoming appointments and history.')).toBeInTheDocument();
	});

	it('shows empty state when no bookings exist', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('No bookings found')).toBeInTheDocument();
		});
		expect(
			screen.getByText('When customers book appointments, they will appear here.')
		).toBeInTheDocument();
	});

	it('fetches bookings for the business on mount', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(mockGetByBusinessId).toHaveBeenCalledWith('biz-123');
		});
	});

	it('displays booking cards when bookings exist', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();

		// Assert on price and payment status
		expect(screen.getByText('£30.00')).toBeInTheDocument();
		expect(screen.getByText('£20.00')).toBeInTheDocument();
		expect(screen.getByText(/paid online/i)).toBeInTheDocument();
		expect(screen.getByText(/pay in store/i)).toBeInTheDocument();
	});

	it('displays service name for each booking', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('Haircut')).toBeInTheDocument();
		});
		expect(screen.getByText('Beard Trim')).toBeInTheDocument();
	});

	it('displays status badge with correct variant', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('confirmed')).toBeInTheDocument();
		});
		expect(screen.getByText('pending')).toBeInTheDocument();
	});

	it('displays formatted date for appointments', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			// date-fns format: 'EEEE, MMM d, yyyy'
			expect(screen.getByText(/Thursday, Jan 15, 2026/i)).toBeInTheDocument();
		});
	});

	it('displays appointment time', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('10:00')).toBeInTheDocument();
		});
		expect(screen.getByText('14:30')).toBeInTheDocument();
	});

	it('displays customer contact information when available', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('john@example.com')).toBeInTheDocument();
		});
		expect(screen.getByText('555-1234')).toBeInTheDocument();
	});

	it('does not fetch bookings when business is not available', () => {
		mockUseAuth.mockReturnValue({ business: null });

		render(<BookingsPage />);

		expect(mockGetByBusinessId).not.toHaveBeenCalled();
	});

	it('calls delete service when delete button is clicked and confirmed', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const user = userEvent.setup();

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		// Find delete buttons
		const deleteButtons = screen.getAllByRole('button');
		const trashButton = deleteButtons.find(
			(btn) => btn.querySelector('svg') && !btn.textContent?.trim()
		);

		if (trashButton) {
			await user.click(trashButton);
		}

		await waitFor(() => {
			expect(confirmSpy).toHaveBeenCalled();
			expect(mockCancel).toHaveBeenCalledWith(mockBookings[0]);
		});

		confirmSpy.mockRestore();
	});

	it('removes booking from list after successful delete', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const user = userEvent.setup();

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByRole('button');
		const trashButton = deleteButtons.find(
			(btn) => btn.querySelector('svg') && !btn.textContent?.trim()
		);

		if (trashButton) {
			await user.click(trashButton);
		}

		await waitFor(() => {
			expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		});
		// Other booking should still be there
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();

		confirmSpy.mockRestore();
	});

	it('shows alert when delete fails', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		mockCancel.mockResolvedValue(false);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
		const user = userEvent.setup();

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByRole('button');
		const trashButton = deleteButtons.find(
			(btn) => btn.querySelector('svg') && !btn.textContent?.trim()
		);

		if (trashButton) {
			await user.click(trashButton);
		}

		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith('Failed to delete booking. Please try again.');
		});

		confirmSpy.mockRestore();
		alertSpy.mockRestore();
	});

	it('does not delete when confirmation is cancelled', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockResolvedValue(mockBookings);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
		const user = userEvent.setup();

		render(<BookingsPage />);

		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
		});

		const deleteButtons = screen.getAllByRole('button');
		const trashButton = deleteButtons.find(
			(btn) => btn.querySelector('svg') && !btn.textContent?.trim()
		);

		if (trashButton) {
			await user.click(trashButton);
		}

		expect(mockCancel).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});
});
