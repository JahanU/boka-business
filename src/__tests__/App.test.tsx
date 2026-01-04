import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock Supabase client
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/config/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: (...args: unknown[]) => mockGetSession(...args),
            onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
        },
    },
}));

// Mock services
vi.mock('@/services/staffService', () => ({
    staffService: {
        getByUserId: vi.fn().mockResolvedValue(null),
    },
}));

vi.mock('@/services/businessService', () => ({
    businessService: {
        getById: vi.fn().mockResolvedValue(null),
    },
}));

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSession.mockResolvedValue({ data: { session: null } });
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });
    });

    it('renders without crashing and shows the home page by default', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getAllByText(/Boka Businesses/i)).toHaveLength(2);
        });
    });

    it('navigates to login page', async () => {
        window.history.pushState({}, 'Login', '/login');
        render(<App />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/you@barbershop.com/i)).toBeInTheDocument();
        });
    });

    it('renders protected routes when authenticated', async () => {
        mockGetSession.mockResolvedValue({
            data: { session: { user: { id: 'test-user' } } },
        });

        window.history.pushState({}, 'Dashboard', '/dashboard');
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/Staff dashboard/i)).toBeInTheDocument();
        });
    });

    it('redirects to login page when not authenticated', async () => {
        mockGetSession.mockResolvedValue({
            data: { session: null },
        });

        window.history.pushState({}, 'Dashboard', '/dashboard');
        render(<App />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/you@barbershop.com/i)).toBeInTheDocument();
        });
    });
});
