import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { StaffAvailability } from '../StaffAvailability';

const mockUseAuth = vi.fn();
const mockGetByStaffId = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('@/services/availabilityService', () => ({
	availabilityService: {
		getByStaffId: (...args: unknown[]) => mockGetByStaffId(...args),
	},
}));

// Mock child components to isolate unit tests
vi.mock('../WeeklySchedule', () => ({
	WeeklySchedule: ({ staffId, loading }: { staffId: string; loading: boolean }) => (
		<div data-testid="weekly-schedule" data-staff-id={staffId} data-loading={loading}>
			WeeklySchedule Mock
		</div>
	),
}));

vi.mock('../AnnualLeave', () => ({
	AnnualLeave: ({ staffId, loading }: { staffId: string; loading: boolean }) => (
		<div data-testid="annual-leave" data-staff-id={staffId} data-loading={loading}>
			AnnualLeave Mock
		</div>
	),
}));

describe('StaffAvailability', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetByStaffId.mockResolvedValue([]);
	});

	it('renders login prompt when no staff is authenticated', () => {
		mockUseAuth.mockReturnValue({ staff: null });

		render(<StaffAvailability />);

		expect(screen.getByText('Staff Availability')).toBeInTheDocument();
		expect(
			screen.getByText('Please log in as a staff member to manage your availability.')
		).toBeInTheDocument();
	});

	it('renders the availability management UI when staff is authenticated', async () => {
		mockUseAuth.mockReturnValue({ staff: { id: 'staff-123' } });

		render(<StaffAvailability />);

		expect(screen.getByText('Manage Availability')).toBeInTheDocument();
		expect(
			screen.getByText('Set your recurring weekly schedule and one-time leave periods.')
		).toBeInTheDocument();
	});

	it('renders tabs for Weekly Schedule and Annual Leave', () => {
		mockUseAuth.mockReturnValue({ staff: { id: 'staff-123' } });

		render(<StaffAvailability />);

		expect(screen.getByRole('tab', { name: /weekly schedule/i })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: /annual leave/i })).toBeInTheDocument();
	});

	it('calls availabilityService.getByStaffId on mount', async () => {
		mockUseAuth.mockReturnValue({ staff: { id: 'staff-123' } });

		render(<StaffAvailability />);

		expect(mockGetByStaffId).toHaveBeenCalledWith('staff-123');
	});

	it('passes staffId to child components', async () => {
		mockUseAuth.mockReturnValue({ staff: { id: 'staff-456' } });
		mockGetByStaffId.mockResolvedValue([]);

		render(<StaffAvailability />);

		const weeklySchedule = await screen.findByTestId('weekly-schedule');
		expect(weeklySchedule).toHaveAttribute('data-staff-id', 'staff-456');
	});
});
