import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../AuthLayout';

const renderWithRouter = (initialRoute = '/') => {
	return render(
		<MemoryRouter initialEntries={[initialRoute]}>
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/" element={<div>Home Content</div>} />
					<Route path="/login" element={<div>Login Content</div>} />
				</Route>
			</Routes>
		</MemoryRouter>
	);
};

describe('AuthLayout', () => {
	it('renders the logo and brand name', () => {
		renderWithRouter();

		expect(screen.getByText('B')).toBeInTheDocument();
		expect(screen.getByText('Boka Businesses')).toBeInTheDocument();
	});

	it('renders the staff portal subtitle', () => {
		renderWithRouter();

		expect(screen.getByText('Staff portal')).toBeInTheDocument();
	});

	it('renders the Home navigation link', () => {
		renderWithRouter();

		expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
	});

	it('renders the Staff Login button', () => {
		renderWithRouter();

		expect(screen.getByRole('link', { name: /staff login/i })).toBeInTheDocument();
	});

	it('renders outlet content', () => {
		renderWithRouter('/');

		expect(screen.getByText('Home Content')).toBeInTheDocument();
	});

	it('renders login page content through outlet', () => {
		renderWithRouter('/login');

		expect(screen.getByText('Login Content')).toBeInTheDocument();
	});

	it('renders logo as a link to home', () => {
		renderWithRouter();

		const logoLinks = screen.getAllByRole('link');
		const logoLink = logoLinks.find((link) => link.getAttribute('href') === '/');
		expect(logoLink).toBeInTheDocument();
	});

	it('highlights the active navigation link', () => {
		renderWithRouter('/');

		const homeLink = screen.getByRole('link', { name: /^home$/i });
		// Active link should have specific styling classes
		expect(homeLink).toHaveClass('bg-accent');
	});

	it('Staff Login button links to /login', () => {
		renderWithRouter();

		const loginButton = screen.getByRole('link', { name: /staff login/i });
		expect(loginButton).toHaveAttribute('href', '/login');
	});

	it('renders with proper layout structure', () => {
		renderWithRouter();

		// Check for the main layout container
		const container = screen.getByText('Boka Businesses').closest('div.mx-auto');
		expect(container).toBeInTheDocument();
	});

	it('renders navigation items in header', () => {
		renderWithRouter();

		const header = screen.getByRole('banner');
		expect(header).toBeInTheDocument();

		// Navigation should be within the header
		const nav = header.querySelector('nav');
		expect(nav).toBeInTheDocument();
	});

	it('renders main content area', () => {
		renderWithRouter();

		const main = screen.getByRole('main');
		expect(main).toBeInTheDocument();
	});
});
