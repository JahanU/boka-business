import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StaffAvailability } from '@/components/StaffAvailability/StaffAvailability';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
	const theme = useTheme();
	const router = useRouter();
	const { signOut } = useAuth();

	const handleLogout = async () => {
		await signOut();
		router.replace('/(auth)');
	};

	return (
		<ScreenBackground>
			<ScrollView style={styles.container} contentContainerStyle={styles.content}>
				<View style={styles.header}>
					<Text variant="headlineMedium" style={styles.title}>
						Settings
					</Text>
					<Text variant="bodyMedium" style={styles.subtitle}>
						Manage your business profile and preferences.
					</Text>
				</View>

				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.cardTitle}>
							Business Information
						</Text>
						<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
							Update your public profile and contact details.
						</Text>
						<View style={styles.placeholder}>
							<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
								Settings configuration will be available here.
							</Text>
						</View>
					</Card.Content>
				</Card>

				<StaffAvailability />

				<Card style={[styles.card, styles.logoutCard]}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.cardTitle}>
							Account
						</Text>
						<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
							Sign out of your account.
						</Text>
						<Button
							mode="outlined"
							onPress={handleLogout}
							style={styles.logoutButton}
							textColor={theme.colors.error}
							icon={({ size, color }) => (
								<Ionicons name="log-out-outline" size={size} color={color} />
							)}
						>
							Log out
						</Button>
					</Card.Content>
				</Card>
			</ScrollView>
		</ScreenBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
		paddingBottom: 32,
	},
	header: {
		marginBottom: 20,
	},
	title: {
		fontWeight: '700',
		fontSize: 30,
		lineHeight: 36,
	},
	subtitle: {
		color: '#8fa4b8',
		fontSize: 15,
		lineHeight: 22,
		marginTop: 4,
	},
	card: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
		marginBottom: 16,
	},
	logoutCard: {
		marginTop: 8,
	},
	cardTitle: {
		fontWeight: '700',
	},
	placeholder: {
		marginTop: 4,
		paddingVertical: 32,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#3a4f64',
		borderRadius: 12,
		backgroundColor: 'rgba(30, 42, 56, 0.4)',
	},
	logoutButton: {
		borderRadius: 10,
		borderColor: 'rgba(239, 68, 68, 0.5)',
	},
});
