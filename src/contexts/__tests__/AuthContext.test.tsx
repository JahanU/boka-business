import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('@/config/supabaseClient', () => ({
	supabase: {
		auth: {
			getSession: (...args: unknown[]) => mockGetSession(...args),
			onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
			signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
			signOut: (...args: unknown[]) => mockSignOut(...args),
			resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
			updateUser: (...args: unknown[]) => mockUpdateUser(...args),
		},
	},
}));

function Consumer() {
	const { user, loading } = useAuth();
	if (loading) {
		return <div>loading</div>;
	}
	return <div>{user ? `user:${user.id}` : 'user:none'}</div>;
}

function Harness({ onReady }: { onReady: (context: ReturnType<typeof useAuth>) => void }) {
	const context = useAuth();
	// Trigger the provided callback once the hook is mounted so tests can exercise helper methods.
	useEffect(() => {
		onReady(context);
	}, [context, onReady]);
	return null;
}

describe('AuthContext', () => {
	beforeEach(() => {
		mockGetSession.mockResolvedValue({ data: { session: null } });
		mockOnAuthStateChange.mockReturnValue({
			data: { subscription: { unsubscribe: vi.fn() } },
		});
		mockSignInWithPassword.mockResolvedValue({ error: null });
		mockSignOut.mockResolvedValue(undefined);
		mockResetPasswordForEmail.mockResolvedValue({ error: null });
		mockUpdateUser.mockResolvedValue({ error: null });
	});

	it('throws when useAuth is used outside provider', () => {
		const ConsoleUser = () => {
			useAuth();
			return null;
		};

		expect(() => render(<ConsoleUser />)).toThrow('useAuth must be used within an AuthProvider');
	});

	it('loads the initial session and exposes user state', async () => {
		mockGetSession.mockResolvedValue({
			data: { session: { user: { id: 'abc' } } },
		});

		render(
			<AuthProvider>
				<Consumer />
			</AuthProvider>,
		);

		expect(screen.getByText('loading')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('user:abc')).toBeInTheDocument();
		});
	});

	it('unsubscribes from auth changes on unmount', () => {
		const unsubscribe = vi.fn();
		mockOnAuthStateChange.mockReturnValue({
			data: { subscription: { unsubscribe } },
		});

		const { unmount } = render(
			<AuthProvider>
				<Consumer />
			</AuthProvider>,
		);

		unmount();
		expect(unsubscribe).toHaveBeenCalled();
	});

	it('calls auth helpers with the expected payloads', async () => {
		const onReady = vi.fn();

		render(
			<AuthProvider>
				<Harness onReady={onReady} />
			</AuthProvider>,
		);

		await waitFor(() => expect(onReady).toHaveBeenCalled());
		const context = onReady.mock.calls[0][0];

		await context.signIn('  ruhee@gmail.com  ', 'ruhee');
		expect(mockSignInWithPassword).toHaveBeenCalledWith({
			email: 'ruhee@gmail.com',
			password: 'ruhee',
		});

		await context.resetPassword('  ruhee@gmail.com ');
		expect(mockResetPasswordForEmail).toHaveBeenCalledWith('ruhee@gmail.com', {
			redirectTo: `${window.location.origin}/reset-password`,
		});

		await context.updatePassword('newpass');
		expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass' });

		await context.signOut();
		expect(mockSignOut).toHaveBeenCalled();
	});
});
