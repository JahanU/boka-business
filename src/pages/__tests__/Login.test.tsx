import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPage from '../Login';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('LoginPage', () => {
	beforeEach(() => {
		mockUseAuth.mockReset();
		mockNavigate.mockReset();
	});

	it.skip('redirects to dashboard if already authenticated', async () => {
		mockUseAuth.mockReturnValue({
			signIn: vi.fn(),
			resetPassword: vi.fn(),
			user: { id: 'user-1' },
			loading: false,
		});

		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
		});
	});

	it.skip('submits login credentials and navigates on success', async () => {
		const signIn = vi.fn().mockResolvedValue({ error: null });

		mockUseAuth.mockReturnValue({
			signIn,
			resetPassword: vi.fn(),
			user: null,
			loading: false,
		});

		const user = userEvent.setup();
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		await user.type(screen.getByLabelText(/work email/i), 'ruhee@gmail.com');
		await user.type(screen.getByLabelText(/^password$/i), 'secret');
		await user.click(screen.getByRole('button', { name: /continue/i }));

		await waitFor(() => {
			expect(signIn).toHaveBeenCalledWith('ruhee@gmail.com', 'secret');
			expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
		});
	});

	it('shows a login error message when credentials fail', async () => {
		const signIn = vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } });

		mockUseAuth.mockReturnValue({
			signIn,
			resetPassword: vi.fn(),
			user: null,
			loading: false,
		});

		const user = userEvent.setup();
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		await user.type(screen.getByLabelText(/work email/i), 'ruhee@gmail.com');
		await user.type(screen.getByLabelText(/^password$/i), 'secret');
		await user.click(screen.getByRole('button', { name: /continue/i }));

		expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
	});

	it('sends a reset link and returns to login mode', async () => {
		const resetPassword = vi.fn().mockResolvedValue({ error: null });

		mockUseAuth.mockReturnValue({
			signIn: vi.fn(),
			resetPassword,
			user: null,
			loading: false,
		});

		const user = userEvent.setup();
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>,
		);

		await user.click(screen.getByRole('button', { name: /forgot password/i }));
		expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();

		await user.type(screen.getByLabelText(/work email/i), 'reset@example.com');
		await user.click(screen.getByRole('button', { name: /send reset link/i }));

		await waitFor(() => {
			expect(resetPassword).toHaveBeenCalledWith('reset@example.com');
		});

		expect(
			await screen.findByText(/check your email for a password reset link/i),
		).toBeInTheDocument();
		expect(await screen.findByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
	});
});
