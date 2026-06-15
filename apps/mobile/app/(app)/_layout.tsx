import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const tabLabelColor = DynamicColorIOS({
	dark: '#ffffff',
	light: '#000000',
});

const tabTintColor = DynamicColorIOS({
	dark: '#2b8bf7',
	light: '#2b8bf7',
});

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
		<NativeTabs
			tintColor={tabTintColor}
			labelStyle={{ color: tabLabelColor }}
		>
			<NativeTabs.Trigger name="index">
				<NativeTabs.Trigger.Icon
					sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
					md={{ default: 'analytics', selected: 'analytics' }}
				/>
				<NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="bookings">
				<NativeTabs.Trigger.Icon
					sf={{ default: 'calendar', selected: 'calendar' }}
					md={{ default: 'calendar_today', selected: 'calendar_today' }}
				/>
				<NativeTabs.Trigger.Label>Bookings</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="settings">
				<NativeTabs.Trigger.Icon
					sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
					md={{ default: 'settings', selected: 'settings' }}
				/>
				<NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
