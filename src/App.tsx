import { Suspense, lazy, ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import HomePage from '@/pages/Home';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const LoginPage = lazy(() => import('@/pages/Login'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const BookingsPage = lazy(() => import('@/pages/Bookings'));
const SettingsPage = lazy(() => import('@/pages/Settings'));

function PageSuspense({ children }: { children: ReactNode }) {
	return (
		<Suspense
			fallback={
				<div className="flex h-[400px] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
					<span className="sr-only">Loading page</span>
				</div>
			}
		>
			{children}
		</Suspense>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route element={<AuthLayout />}>
						<Route index element={<HomePage />} />
						<Route
							path="/login"
							element={
								<PageSuspense>
									<LoginPage />
								</PageSuspense>
							}
						/>
						<Route
							path="/reset-password"
							element={
								<PageSuspense>
									<ResetPasswordPage />
								</PageSuspense>
							}
						/>
					</Route>

					<Route
						element={
							<ProtectedRoute>
								<DashboardLayout />
							</ProtectedRoute>
						}
					>
						<Route
							path="/dashboard"
							element={
								<PageSuspense>
									<DashboardPage />
								</PageSuspense>
							}
						/>
						<Route
							path="/bookings"
							element={
								<PageSuspense>
									<BookingsPage />
								</PageSuspense>
							}
						/>
						<Route
							path="/settings"
							element={
								<PageSuspense>
									<SettingsPage />
								</PageSuspense>
							}
						/>
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
