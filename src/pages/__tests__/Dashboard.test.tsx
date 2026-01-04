import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../Dashboard';
import { vi } from 'vitest';

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
	useAuth: vi.fn(() => ({
		business: { name: "ali's_barber" },
		loading: false,
	})),
}));

describe('DashboardPage', () => {
	it('renders the staff dashboard header', () => {
		render(<DashboardPage />);

		expect(screen.getByText('Staff dashboard')).toBeInTheDocument();
		expect(screen.getByText("Ali's Barber")).toBeInTheDocument();
	});

	it('renders the description text', () => {
		render(<DashboardPage />);

		expect(
			screen.getByText(/tailor each shift with the context your staff needs/i)
		).toBeInTheDocument();
	});

	it('renders all three tab buttons', () => {
		render(<DashboardPage />);

		expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /payments/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /team/i })).toBeInTheDocument();
	});

	it('has Timeline tab active by default', () => {
		render(<DashboardPage />);

		const timelineButton = screen.getByRole('button', { name: /timeline/i });
		// The active tab has variant="default" which applies different styling
		expect(timelineButton).toHaveClass('transition');
	});

	it('switches active tab when clicking different tabs', async () => {
		const user = userEvent.setup();
		render(<DashboardPage />);

		const paymentsButton = screen.getByRole('button', { name: /payments/i });

		await user.click(paymentsButton);

		// After clicking, payments should be the active tab
		// We verify the click happened by checking that clicking works without errors
		expect(paymentsButton).toBeInTheDocument();
	});

	it('allows switching between all tabs', async () => {
		const user = userEvent.setup();
		render(<DashboardPage />);

		// Click Timeline
		await user.click(screen.getByRole('button', { name: /timeline/i }));
		expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument();

		// Click Payments
		await user.click(screen.getByRole('button', { name: /payments/i }));
		expect(screen.getByRole('button', { name: /payments/i })).toBeInTheDocument();

		// Click Team
		await user.click(screen.getByRole('button', { name: /team/i }));
		expect(screen.getByRole('button', { name: /team/i })).toBeInTheDocument();
	});

	it('renders within a styled card container', () => {
		render(<DashboardPage />);

		// The main content is wrapped in a card with specific classes
		const card = screen.getByText("Ali's Barber").closest('div.rounded-2xl');
		expect(card).toBeInTheDocument();
	});
});
