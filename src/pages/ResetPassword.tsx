import { useState, type FormEvent } from 'react';
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

function ResetPasswordPage() {
	const { user, loading, updatePassword, signOut } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const resetLinkInvalid = !loading && !user;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
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
		navigate('/login', { replace: true });
	};

	return (
		<div className="mx-auto max-w-xl">
			<Card>
				<CardHeader className="space-y-2">
					<p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Reset password</p>
					<CardTitle className="text-2xl">Choose a new password</CardTitle>
					<CardDescription>
            Enter and confirm your new password to complete your account recovery.
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-6">
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-2">
							<Label htmlFor="new-password">New password</Label>
							<Input
								id="new-password"
								name="new-password"
								type="password"
								autoComplete="new-password"
								placeholder="••••••••"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="confirm-password">Confirm password</Label>
							<Input
								id="confirm-password"
								name="confirm-password"
								type="password"
								autoComplete="new-password"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
							/>
						</div>
						{resetLinkInvalid && !error ? (
							<p className="text-sm text-destructive" role="alert">
                Reset link is invalid or has expired. Please request a new one.
							</p>
						) : null}
						{error ? (
							<p className="text-sm text-destructive" role="alert">
								{error}
							</p>
						) : null}
						{message ? (
							<p className="text-sm text-muted-foreground" role="status">
								{message}
							</p>
						) : null}
						<Button type="submit" size="lg" disabled={submitting || loading || !user}>
							{submitting ? 'Saving...' : 'Update password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default ResetPasswordPage;
