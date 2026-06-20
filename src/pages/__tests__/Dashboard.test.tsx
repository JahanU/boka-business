import { render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '../Dashboard';
import { Appointment } from '@/types';

const mockUseAuth = vi.fn();
const mockGetByBusinessId = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/appointmentService', () => ({
	appointmentService: {
		getByBusinessId: (...args: unknown[]) => mockGetByBusinessId(...args),
	},
}));

const mockAppointments: Appointment[] = [
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
		customer_name: 'Jane Smith',
		service_id: 'service-2',
		service_name: 'Beard Trim',
		service_price: 20,
		payment_status: 'pay_in_store',
		appointment_date: new Date().toISOString().split('T')[0],
		appointment_time: '23:00:00',
		duration_minutes: 20,
		status: 'confirmed',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
	},
];

describe('DashboardPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetByBusinessId.mockResolvedValue([]);
	});

	it('renders the staff dashboard header', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('Staff dashboard')).toBeInTheDocument();
			expect(screen.getByText("Ali's Barber")).toBeInTheDocument();
		});
	});

	it('shows loading state initially', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: true });

		render(<DashboardPage />);

		// Wait for loading spinner to appear
		await waitFor(() => {
			expect(screen.queryByText('Staff dashboard')).not.toBeInTheDocument();
		});
	});

	it('fetches appointments for the business', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-123', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(mockGetByBusinessId).toHaveBeenCalledWith('biz-123');
		});
	});

	it('renders key metric cards', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText("Today's Revenue")).toBeInTheDocument();
			expect(screen.getByText('This Week')).toBeInTheDocument();
			expect(screen.getByText('Remaining Today')).toBeInTheDocument();
		});
	});

	it('displays revenue metrics', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			// Should show total revenue (30 + 20 = 50)
			const revenueElements = screen.getAllByText(/50\.00/);
			expect(revenueElements.length).toBeGreaterThan(0);
		});
	});

	it('renders weekly revenue chart', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('7-Day Revenue')).toBeInTheDocument();
			expect(screen.getByText('Daily revenue for the past week')).toBeInTheDocument();
		});
	});

	it('renders weekly insights section', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('Weekly Insights')).toBeInTheDocument();
			expect(screen.getByText('Payment Status')).toBeInTheDocument();
			expect(screen.getByText('Popular Services')).toBeInTheDocument();
		});
	});

	it('displays payment breakdown', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('Paid Online')).toBeInTheDocument();
			expect(screen.getByText('Pay in Store')).toBeInTheDocument();
		});
	});

	it("renders today's schedule section", async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
			expect(screen.getByText('Upcoming appointments for today')).toBeInTheDocument();
		});
	});

	it('displays appointments in schedule', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			const scheduleHeading = screen.getByText("Today's Schedule");
			const scheduleCard = scheduleHeading.closest('.rounded-xl') as HTMLElement;
			expect(within(scheduleCard).getByText('John Doe')).toBeInTheDocument();
			expect(within(scheduleCard).getByText('Haircut')).toBeInTheDocument();
		});
	});

	it('shows empty state when no appointments', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue([]);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText('No appointments scheduled for today')).toBeInTheDocument();
		});
	});

	it('displays link to view all bookings', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			const link = screen.getByText('View all');
			expect(link).toBeInTheDocument();
			expect(link.closest('a')).toHaveAttribute('href', '/bookings');
		});
	});

	it('shows trend indicators for weekly bookings', async () => {
		mockUseAuth.mockReturnValue({ business: { id: 'biz-1', name: "ali's_barber" }, loading: false });
		mockGetByBusinessId.mockResolvedValue(mockAppointments);

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByText(/vs last week/)).toBeInTheDocument();
		});
	});
});
