import { useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	ScrollView,
	Platform,
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function LoginScreen() {
	const { signIn, resetPassword, user, loading } = useAuth();
	const router = useRouter();
	const theme = useTheme();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [mode, setMode] = useState<'login' | 'reset'>('login');

	if (!loading && user) {
		return (
			<ScreenBackground>
				<View style={styles.centered}>
					<Text variant="bodyLarge">Redirecting…</Text>
				</View>
			</ScreenBackground>
		);
	}

	const handleSubmit = async () => {
		setError(null);
		setMessage(null);
		setSubmitting(true);

		if (mode === 'login') {
			const { error: signInError } = await signIn(email, password);
			setSubmitting(false);
			if (signInError) {
				setError(signInError.message);
				return;
			}
			router.replace('/(app)');
			return;
		}

		const { error: resetError } = await resetPassword(email);
		setSubmitting(false);
		if (resetError) {
			setError(resetError.message);
			return;
		}
		setMessage('Check your email for a password reset link.');
		setMode('login');
	};

	return (
		<ScreenBackground>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.card}>
						<Text variant="labelLarge" style={styles.eyebrow}>
							Staff login
						</Text>
						<Text variant="headlineMedium" style={styles.title}>
							Access your dashboard
						</Text>
						<Text variant="bodyMedium" style={styles.subtitle}>
							Sign in with your staff credentials to manage bookings and
							payments.
						</Text>

						<TextInput
							label="Work email"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							textContentType="emailAddress"
							style={styles.input}
							mode="outlined"
							outlineColor={theme.colors.outline}
							activeOutlineColor={theme.colors.primary}
						/>
						{mode === 'login' && (
							<TextInput
								label="Password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								textContentType="password"
								style={styles.input}
								mode="outlined"
								outlineColor={theme.colors.outline}
								activeOutlineColor={theme.colors.primary}
							/>
						)}

						{error && <Text style={styles.error}>{error}</Text>}
						{message && <Text style={styles.message}>{message}</Text>}

						<Button
							mode="contained"
							onPress={handleSubmit}
							loading={submitting}
							disabled={submitting || loading}
							style={styles.button}
							contentStyle={styles.buttonContent}
							buttonColor={theme.colors.primary}
							textColor={theme.colors.onPrimary}
						>
							{mode === 'login' ? 'Continue' : 'Send reset link'}
						</Button>

						<Button
							mode="text"
							onPress={() => {
								setMode((current) =>
									current === 'login' ? 'reset' : 'login'
								);
								setError(null);
								setMessage(null);
								setPassword('');
							}}
							style={styles.link}
							textColor={theme.colors.onSurfaceVariant}
						>
							{mode === 'login' ? 'Forgot password?' : 'Back to login'}
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ScreenBackground>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	scroll: {
		flexGrow: 1,
		justifyContent: 'center',
		padding: 24,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	card: {
		width: '100%',
		maxWidth: 420,
		alignSelf: 'center',
		backgroundColor: '#16202b',
		borderRadius: 16,
		padding: 32,
		borderWidth: 1,
		borderColor: '#3a4f64',
		gap: 16,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 8 },
				shadowOpacity: 0.35,
				shadowRadius: 24,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	eyebrow: {
		color: '#4dd9e6',
		textTransform: 'uppercase',
		letterSpacing: 2.5,
		fontSize: 12,
	},
	title: {
		fontWeight: '700',
		color: '#ffffff',
		fontSize: 28,
		lineHeight: 34,
	},
	subtitle: {
		color: '#8fa4b8',
		marginBottom: 8,
		fontSize: 15,
		lineHeight: 22,
	},
	input: {
		backgroundColor: 'transparent',
	},
	button: {
		marginTop: 8,
		borderRadius: 10,
	},
	buttonContent: {
		paddingVertical: 8,
	},
	link: {
		alignSelf: 'center',
	},
	error: {
		color: '#f87171',
	},
	message: {
		color: '#8fa4b8',
	},
});
