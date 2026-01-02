import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { WeeklySchedule } from '../WeeklySchedule';
import type { StaffAvailability } from '@/types';

const mockValidateNoConflict = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/services/availabilityService', () => ({
	availabilityService: {
		validateNoConflict: (...args: unknown[]) => mockValidateNoConflict(...args),
		create: (...args: unknown[]) => mockCreate(...args),
		update: (...args: unknown[]) => mockUpdate(...args),
		delete: (...args: unknown[]) => mockDelete(...args),
	},
}));

const mockAvailability: StaffAvailability[] = [
	{
		id: 'avail-1',
		staff_id: 'staff-123',
		availability_type: 'working_hours',
		day_of_week: 0, // Monday
		start_time: '09:00',
		end_time: '17:00',
		is_recurring: true,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
	{
		id: 'avail-2',
		staff_id: 'staff-123',
		availability_type: 'working_hours',
		day_of_week: 2, // Wednesday
		start_time: '10:00',
		end_time: '18:00',
		is_recurring: true,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
];

describe('WeeklySchedule', () => {
	const defaultProps = {
		staffId: 'staff-123',
		availability: [] as StaffAvailability[],
		onUpdate: vi.fn(),
		loading: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockValidateNoConflict.mockResolvedValue(true);
		mockCreate.mockResolvedValue({ id: 'new-avail' });
		mockUpdate.mockResolvedValue(true);
		mockDelete.mockResolvedValue(true);
	});

	it('renders loading state', () => {
		render(<WeeklySchedule {...defaultProps} loading={true} />);

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('renders all 7 days of the week', () => {
		render(<WeeklySchedule {...defaultProps} />);

		expect(screen.getByLabelText('Monday')).toBeInTheDocument();
		expect(screen.getByLabelText('Tuesday')).toBeInTheDocument();
		expect(screen.getByLabelText('Wednesday')).toBeInTheDocument();
		expect(screen.getByLabelText('Thursday')).toBeInTheDocument();
		expect(screen.getByLabelText('Friday')).toBeInTheDocument();
		expect(screen.getByLabelText('Saturday')).toBeInTheDocument();
		expect(screen.getByLabelText('Sunday')).toBeInTheDocument();
	});

	it('shows days as enabled when availability exists', () => {
		render(<WeeklySchedule {...defaultProps} availability={mockAvailability} />);

		// Monday and Wednesday should be checked
		expect(screen.getByLabelText('Monday')).toBeChecked();
		expect(screen.getByLabelText('Wednesday')).toBeChecked();

		// Other days should not be checked
		expect(screen.getByLabelText('Tuesday')).not.toBeChecked();
		expect(screen.getByLabelText('Thursday')).not.toBeChecked();
	});

	it('shows "Unavailable" text for disabled days', () => {
		render(<WeeklySchedule {...defaultProps} />);

		// All days should show "Unavailable" when no availability
		const unavailableTexts = screen.getAllByText('Unavailable');
		expect(unavailableTexts.length).toBe(7);
	});

	it('toggles day enabled state when checkbox is clicked', async () => {
		const user = userEvent.setup();
		render(<WeeklySchedule {...defaultProps} />);

		const mondayCheckbox = screen.getByLabelText('Monday');
		expect(mondayCheckbox).not.toBeChecked();

		await user.click(mondayCheckbox);

		expect(mondayCheckbox).toBeChecked();
	});

	it('shows time pickers when day is enabled', async () => {
		const user = userEvent.setup();
		render(<WeeklySchedule {...defaultProps} />);

		await user.click(screen.getByLabelText('Monday'));

		// Should show From and To labels for time selection
		expect(screen.getByText('From')).toBeInTheDocument();
		expect(screen.getByText('To')).toBeInTheDocument();
	});

	it('renders the save button', () => {
		render(<WeeklySchedule {...defaultProps} />);

		expect(screen.getByRole('button', { name: /save weekly schedule/i })).toBeInTheDocument();
	});

	it('calls onUpdate after successful save', async () => {
		const onUpdate = vi.fn();
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} onUpdate={onUpdate} />);

		// Enable Monday
		await user.click(screen.getByLabelText('Monday'));

		// Click save
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalled();
		});
	});

	it('creates new availability when enabling a day without existing entry', async () => {
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} />);

		await user.click(screen.getByLabelText('Monday'));
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(mockCreate).toHaveBeenCalledWith('staff-123', expect.objectContaining({
				availability_type: 'working_hours',
				day_of_week: 0,
				is_recurring: true,
			}));
		});
	});

	it('updates existing availability when modifying an enabled day', async () => {
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} availability={mockAvailability} />);

		// Monday is already enabled with avail-1
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(mockUpdate).toHaveBeenCalledWith('avail-1', expect.objectContaining({
				availability_type: 'working_hours',
			}));
		});
	});

	it('deletes availability when disabling a day with existing entry', async () => {
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} availability={mockAvailability} />);

		// Disable Monday (which has avail-1)
		await user.click(screen.getByLabelText('Monday'));
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(mockDelete).toHaveBeenCalledWith('avail-1');
		});
	});

	it('validates for conflicts before saving', async () => {
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} />);

		await user.click(screen.getByLabelText('Monday'));
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(mockValidateNoConflict).toHaveBeenCalled();
		});
	});

	it('shows alert when conflict is detected', async () => {
		mockValidateNoConflict.mockResolvedValue(false);
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} />);

		await user.click(screen.getByLabelText('Monday'));
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Time conflict'));
		});

		alertSpy.mockRestore();
	});

	it('shows saving state on button while saving', async () => {
		mockCreate.mockImplementation(() => new Promise(() => {})); // Never resolves
		const user = userEvent.setup();

		render(<WeeklySchedule {...defaultProps} />);

		await user.click(screen.getByLabelText('Monday'));
		await user.click(screen.getByRole('button', { name: /save weekly schedule/i }));

		await waitFor(() => {
			expect(screen.getByRole('button', { name: /saving schedule/i })).toBeInTheDocument();
		});
	});
});
