import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { DashboardLayout } from '../DashboardLayout';

const mockSignOut = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => ({
		signOut: mockSignOut,
	}),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const renderWithRouter = (initialRoute = '/dashboard') => {
	return render(
		<MemoryRouter initialEntries={[initialRoute]}>
			<Routes>
				<Route element={<DashboardLayout />}>
					<Route path="/dashboard" element={<div>Dashboard Content</div>} />
					<Route path="/bookings" element={<div>Bookings Content</div>} />
					<Route path="/settings" element={<div>Settings Content</div>} />
				</Route>
				<Route path="/" element={<div>Home Page</div>} />
			</Routes>
		</MemoryRouter>
	);
};

describe('DashboardLayout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSignOut.mockResolvedValue(undefined);
	});

	it('renders the logo and brand name', () => {
		renderWithRouter();

		expect(screen.getByText('B')).toBeInTheDocument();
		expect(screen.getByText('Boka Businesses')).toBeInTheDocument();
	});

	it('renders navigation links', () => {
		renderWithRouter();

		expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /bookings/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
	});

	it('renders the logout button', () => {
		renderWithRouter();

		expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
	});

	it('renders outlet content', () => {
		renderWithRouter('/dashboard');

		expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
	});

	it('navigates to different routes', async () => {
		const user = userEvent.setup();
		renderWithRouter('/dashboard');

		await user.click(screen.getByRole('link', { name: /bookings/i }));

		expect(screen.getByText('Bookings Content')).toBeInTheDocument();
	});

	it('highlights the active navigation link', () => {
		renderWithRouter('/dashboard');

		const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
		// Active link should have specific styling classes
		expect(dashboardLink).toHaveClass('text-primary');
	});

	it('calls signOut and navigates to home on logout click', async () => {
		const user = userEvent.setup();
		renderWithRouter();

		await user.click(screen.getByRole('button', { name: /logout/i }));

		await waitFor(() => {
			expect(mockSignOut).toHaveBeenCalled();
			expect(mockNavigate).toHaveBeenCalledWith('/');
		});
	});

	it('renders the logo as a link to home', () => {
		renderWithRouter();

		const logoLink = screen.getByRole('link', { name: /boka businesses/i });
		expect(logoLink).toHaveAttribute('href', '/');
	});

	it('renders mobile navigation at bottom', () => {
		renderWithRouter();

		// Mobile navigation is rendered but may be hidden via CSS
		// We check that the structure is in place
		const navElements = screen.getAllByRole('navigation');
		expect(navElements.length).toBeGreaterThanOrEqual(1);
	});

	it('renders header with sticky positioning classes', () => {
		renderWithRouter();

		const header = screen.getByRole('banner');
		expect(header).toHaveClass('sticky', 'top-0');
	});

	it('navigates to settings page', async () => {
		const user = userEvent.setup();
		renderWithRouter('/dashboard');

		await user.click(screen.getByRole('link', { name: /settings/i }));

		expect(screen.getByText('Settings Content')).toBeInTheDocument();
	});
});
