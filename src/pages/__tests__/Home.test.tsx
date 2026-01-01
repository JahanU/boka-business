import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../Home';

describe('HomePage', () => {
	it('renders the hero content and login link', () => {
		render(
			<MemoryRouter>
				<HomePage />
			</MemoryRouter>,
		);

		expect(
			screen.getByText(/manage your barbershop in one place/i),
		).toBeInTheDocument();

		const loginLink = screen.getByRole('link', { name: /go to staff login/i });
		expect(loginLink).toHaveAttribute('href', '/login');
	});

	it('renders highlight cards', () => {
		render(
			<MemoryRouter>
				<HomePage />
			</MemoryRouter>,
		);

		expect(screen.getByText('Booking overview')).toBeInTheDocument();
		expect(screen.getByText('Payments')).toBeInTheDocument();
		expect(screen.getByText('Staff tools')).toBeInTheDocument();
	});
});
