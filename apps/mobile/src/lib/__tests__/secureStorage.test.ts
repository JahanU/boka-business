import { secureStorage } from '../secureStorage';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
	getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
	setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
	deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

describe('secureStorage', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('delegates getItem to SecureStore', async () => {
		await secureStorage.getItem('session');
		expect(mockGetItemAsync).toHaveBeenCalledWith('session');
	});

	it('delegates setItem to SecureStore', async () => {
		await secureStorage.setItem('session', 'token');
		expect(mockSetItemAsync).toHaveBeenCalledWith('session', 'token');
	});

	it('delegates removeItem to SecureStore', async () => {
		await secureStorage.removeItem('session');
		expect(mockDeleteItemAsync).toHaveBeenCalledWith('session');
	});
});
