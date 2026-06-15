import { Buffer } from 'buffer';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { theme } from '@/theme';

if (typeof global.Buffer === 'undefined') {
	global.Buffer = Buffer;
}

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<AuthProvider>
					<Stack screenOptions={{ headerShown: false }} />
				</AuthProvider>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
