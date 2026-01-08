import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import BookingsPage from '@/pages/Bookings';
import SettingsPage from '@/pages/Settings';
import DashboardPage from '@/pages/Dashboard';
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';
import ResetPasswordPage from '@/pages/ResetPassword';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route element={<AuthLayout />}>
						<Route index element={<HomePage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/reset-password" element={<ResetPasswordPage />} />
					</Route>

					<Route
						element={
							<ProtectedRoute>
								<DashboardLayout />
							</ProtectedRoute>
						}
					>
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/bookings" element={<BookingsPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
