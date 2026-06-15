import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordScreen() {
	const { user, loading, updatePassword, signOut } = useAuth();
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async () => {
		setError(null);
		setMessage(null);

		if (!user) {
			setError('Reset link is invalid or has expired. Please request a new one.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords must match.');
			return;
		}

		setSubmitting(true);
		const { error: updateError } = await updatePassword(password);
		setSubmitting(false);

		if (updateError) {
			setError(updateError.message);
			return;
		}

		setMessage('Password updated. Sign in with your new password.');
		await signOut();
		router.replace('/(auth)');
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text variant="headlineMedium" style={styles.title}>
					Reset Password
				</Text>
				<Text variant="bodyMedium" style={styles.subtitle}>
					Enter and confirm your new password to complete your account recovery.
				</Text>

				<TextInput
					label="New password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					style={styles.input}
					mode="outlined"
				/>
				<TextInput
					label="Confirm password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
					style={styles.input}
					mode="outlined"
				/>

				{!loading && !user && !error && (
					<Text style={styles.error}>Reset link is invalid or has expired.</Text>
				)}
				{error && <Text style={styles.error}>{error}</Text>}
				{message && <Text style={styles.message}>{message}</Text>}

				<Button
					mode="contained"
					onPress={handleSubmit}
					loading={submitting}
					disabled={submitting || loading || !user}
					style={styles.button}
				>
					Update password
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 24,
	},
	card: {
		gap: 16,
	},
	title: {
		fontWeight: '700',
	},
	subtitle: {
		opacity: 0.7,
		marginBottom: 8,
	},
	input: {
		backgroundColor: 'transparent',
	},
	button: {
		marginTop: 8,
	},
	error: {
		color: '#ef4444',
	},
	message: {
		opacity: 0.7,
	},
});
