import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from '../Settings';

// Mock the StaffAvailability component since it's tested separately
vi.mock('@/components/StaffAvailability/StaffAvailability', () => ({
	StaffAvailability: () => <div data-testid="staff-availability">StaffAvailability Mock</div>,
}));

describe('SettingsPage', () => {
	it('renders the settings page header', () => {
		render(<SettingsPage />);

		expect(screen.getByText('Settings')).toBeInTheDocument();
		expect(
			screen.getByText('Manage your business profile and preferences.')
		).toBeInTheDocument();
	});

	it.skip('renders the business information card', () => {
		render(<SettingsPage />);

		expect(screen.getByText('Business Information')).toBeInTheDocument();
		expect(
			screen.getByText('Update your public profile and contact details.')
		).toBeInTheDocument();
	});

	it.skip('shows placeholder for settings configuration', () => {
		render(<SettingsPage />);

		expect(
			screen.getByText('Settings configuration will be available here.')
		).toBeInTheDocument();
	});

	it('renders the StaffAvailability component', () => {
		render(<SettingsPage />);

		expect(screen.getByTestId('staff-availability')).toBeInTheDocument();
	});

	it('renders in the correct layout structure', () => {
		render(<SettingsPage />);

		// The page should have a top-level div with space-y-6 class
		const container = screen.getByText('Settings').closest('div.space-y-6');
		expect(container).toBeInTheDocument();
	});
});
