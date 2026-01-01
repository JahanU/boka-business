import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background text-foreground">
				<div className="space-y-3 text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
					<p className="text-sm text-muted-foreground">Checking if you're real 🤖</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
}
