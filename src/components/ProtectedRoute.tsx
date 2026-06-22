import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/demo';

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return null;
	}

	if (!user && !isDemoMode()) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return <>{children}</>;
}