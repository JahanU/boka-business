import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#151d27' }}>
				<ActivityIndicator size="large" color="#2b8bf7" />
			</View>
		);
	}

	if (!user) {
		return <Redirect href="/(auth)" />;
	}

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#16202b',
					borderTopColor: '#3a4f64',
					borderTopWidth: 1,
				},
				tabBarActiveTintColor: '#2b8bf7',
				tabBarInactiveTintColor: '#8fa4b8',
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Dashboard',
					tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="bookings"
				options={{
					title: 'Bookings',
					tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
}
