import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
	beforeEach(() => {
		mockUseAuth.mockReset();
	});

	it('renders children when authenticated', () => {
		mockUseAuth.mockReturnValue({ user: { id: '123' } });

		render(
			<MemoryRouter>
				<ProtectedRoute>
					<div>Private</div>
				</ProtectedRoute>
			</MemoryRouter>,
		);

		expect(screen.getByText('Private')).toBeInTheDocument();
	});

	it('redirects to login when unauthenticated', () => {
		mockUseAuth.mockReturnValue({ user: null });

		render(
			<MemoryRouter initialEntries={['/dashboard']}>
				<Routes>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<div>Private</div>
							</ProtectedRoute>
						}
					/>
					<Route path="/login" element={<div>Login</div>} />
				</Routes>
			</MemoryRouter>,
		);
		expect(screen.getByText('Login')).toBeInTheDocument();
	});
});
