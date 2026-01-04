import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AnnualLeave } from '../AnnualLeave';
import type { StaffAvailability } from '@/types';

const mockCreate = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/services/availabilityService', () => ({
	availabilityService: {
		create: (...args: unknown[]) => mockCreate(...args),
		delete: (...args: unknown[]) => mockDelete(...args),
	},
}));

const mockLeaveEntries: StaffAvailability[] = [
	{
		id: 'leave-1',
		staff_id: 'staff-123',
		availability_type: 'annual_leave',
		specific_date: '2026-01-15',
		end_date: '2026-01-20',
		is_recurring: false,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
	{
		id: 'leave-2',
		staff_id: 'staff-123',
		availability_type: 'annual_leave',
		specific_date: '2026-02-10',
		end_date: '2026-02-10',
		is_recurring: false,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
	},
];

describe('AnnualLeave', () => {
	const defaultProps = {
		staffId: 'staff-123',
		availability: [] as StaffAvailability[],
		onUpdate: vi.fn(),
		loading: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockCreate.mockResolvedValue({ id: 'new-leave' });
		mockDelete.mockResolvedValue(true);
	});

	it('renders loading state', () => {
		render(<AnnualLeave {...defaultProps} loading={true} />);

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('renders the annual leave section with title and description', () => {
		render(<AnnualLeave {...defaultProps} />);

		expect(screen.getByText('Annual Leave')).toBeInTheDocument();
		expect(screen.getByText('Mark dates when you will be fully unavailable.')).toBeInTheDocument();
	});

	it('shows empty state when no leave entries exist', () => {
		render(<AnnualLeave {...defaultProps} />);

		expect(screen.getByText('No annual leave entries found.')).toBeInTheDocument();
	});

	it('displays existing leave entries', () => {
		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} />);

		// Should show date ranges for leave entries
		expect(screen.getByText('2026-01-15 to 2026-01-20')).toBeInTheDocument();
		expect(screen.getByText('2026-02-10')).toBeInTheDocument();
	});

	it('shows "Unavailable all day" for each leave entry', () => {
		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} />);

		const unavailableTexts = screen.getAllByText('Unavailable all day');
		expect(unavailableTexts.length).toBe(2);
	});

	it('renders the add annual leave button', () => {
		render(<AnnualLeave {...defaultProps} />);

		expect(screen.getByRole('button', { name: /add annual leave range/i })).toBeInTheDocument();
	});

	it('shows date picker form when add button is clicked', async () => {
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} />);

		await user.click(screen.getByRole('button', { name: /add annual leave range/i }));

		expect(screen.getByText('Select Leave Dates')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /pick a date range/i })).toBeInTheDocument();
	});

	it('Save Leave Button should be disabled until date is selected', async () => {
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} />);

		await user.click(screen.getByRole('button', { name: /add annual leave range/i }));

		const saveButton = screen.getByRole('button', { name: /save leave/i });
		expect(saveButton).toBeDisabled();

		// Open date picker
		await user.click(screen.getByRole('button', { name: /pick a date range/i }));

		// Select a date (e.g., the 15th of the current month)
		const day15 = screen.getAllByRole('button').find(btn => btn.textContent === '15');
		if (day15) {
			await user.click(day15);
		}

		expect(saveButton).toBeEnabled();
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
	});

	it('closes add form when cancel is clicked', async () => {
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} />);

		await user.click(screen.getByRole('button', { name: /add annual leave range/i }));
		expect(screen.getByText('Select Leave Dates')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /cancel/i }));

		expect(screen.queryByText('Select Leave Dates')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /add annual leave range/i })).toBeInTheDocument();
	});

	it('renders delete button for each leave entry', () => {
		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} />);

		const deleteButtons = screen.getAllByRole('button', { name: '' });
		// Filter for delete buttons (those with Trash2 icon)
		const trashButtons = deleteButtons.filter((btn) =>
			btn.querySelector('svg.lucide-trash-2') || btn.classList.contains('hover:text-destructive')
		);
		expect(trashButtons.length).toBeGreaterThan(0);
	});

	it('calls delete service when delete button is clicked and confirmed', async () => {
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const onUpdate = vi.fn();
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} onUpdate={onUpdate} />);

		// Find and click the first delete button
		const deleteButtons = screen.getAllByRole('button').filter(
			(btn) => btn.querySelector('svg')
		);
		// The delete buttons are the ones without text content
		const trashButton = deleteButtons.find((btn) => !btn.textContent?.trim());
		if (trashButton) {
			await user.click(trashButton);
		}

		await waitFor(() => {
			expect(confirmSpy).toHaveBeenCalled();
			expect(mockDelete).toHaveBeenCalledWith('leave-1');
			expect(onUpdate).toHaveBeenCalled();
		});

		confirmSpy.mockRestore();
	});

	it('does not delete when confirmation is cancelled', async () => {
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} />);

		const deleteButtons = screen.getAllByRole('button').filter(
			(btn) => btn.querySelector('svg')
		);
		const trashButton = deleteButtons.find((btn) => !btn.textContent?.trim());
		if (trashButton) {
			await user.click(trashButton);
		}

		expect(mockDelete).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});

	it('shows alert when delete fails', async () => {
		mockDelete.mockResolvedValue(false);
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
		const user = userEvent.setup();

		render(<AnnualLeave {...defaultProps} availability={mockLeaveEntries} />);

		const deleteButtons = screen.getAllByRole('button').filter(
			(btn) => btn.querySelector('svg')
		);
		const trashButton = deleteButtons.find((btn) => !btn.textContent?.trim());
		if (trashButton) {
			await user.click(trashButton);
		}

		await waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith('Failed to delete entry. Please try again.');
		});

		confirmSpy.mockRestore();
		alertSpy.mockRestore();
	});
});
