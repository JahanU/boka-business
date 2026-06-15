import { Stack } from 'expo-router';

export default function AuthLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" options={{ title: 'Login' }} />
			<Stack.Screen name="reset-password" options={{ title: 'Reset Password' }} />
		</Stack>
	);
}
