import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookingsPage from '../Bookings';

const mockUseAuth = vi.fn();
const mockGetByBusinessId = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/appointmentService', () => ({
	appointmentService: {
		getByBusinessId: (...args: unknown[]) => mockGetByBusinessId(...args),
		delete: (...args: unknown[]) => mockDelete(...args),
	},
}));

const mockBookings = [
	{
		id: 'booking-1',
		business_id: 'biz-123',
		staff_id: 'staff-1',
		customer_name: 'John Doe',
		customer_email: 'john@example.com',
		customer_phone: '555-1234',
		service_name: 'Haircut',
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
		customer_phone: null,
		service_name: 'Beard Trim',
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
		mockDelete.mockResolvedValue(true);
	});

	it('shows loading state initially', () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123' } });
		mockGetByBusinessId.mockImplementation(() => new Promise(() => {})); // Never resolves

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
			expect(mockDelete).toHaveBeenCalledWith('booking-1');
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
		mockDelete.mockResolvedValue(false);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
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

		expect(mockDelete).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});
});
