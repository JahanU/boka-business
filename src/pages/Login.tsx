import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
	const { signIn, resetPassword, user, loading } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [mode, setMode] = useState<'login' | 'reset'>('login');

	useEffect(() => {
		if (!loading && user) {
			navigate('/dashboard', { replace: true }); // Redirect if already logged in
		}
	}, [loading, user, navigate]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
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

			navigate('/dashboard');
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
		<div className="mx-auto max-w-xl">
			<Card>
				<CardHeader className="space-y-2">
					<p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Staff login</p>
					<CardTitle className="text-2xl">Access your dashboard</CardTitle>
					<CardDescription>
            Sign in with your staff credentials to manage bookings and payments.
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-6">
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Work email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="you@barbershop.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>
						{mode === 'login' && (
							<div className="flex flex-col gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
								/>
							</div>
						)}
						{error && (
							<p className="text-sm text-destructive" role="alert">
								{error}
							</p>
						)}
						{message && (
							<p className="text-sm text-muted-foreground" role="status">
								{message}
							</p>
						)}
						<Button type="submit" size="lg" disabled={submitting || loading}>
							{submitting ? 'Working...' : mode === 'login' ? 'Continue' : 'Send reset link'}
						</Button>
						<button
							type="button"
							className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
							onClick={() => {
								setMode((current) => (current === 'login' ? 'reset' : 'login'));
								setError(null);
								setMessage(null);
								setSubmitting(false);
								setPassword('');
							}}
						>
							{mode === 'login' ? 'Forgot password?' : 'Back to login'}
						</button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default LoginPage;
