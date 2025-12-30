import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import DashboardPage from '@/pages/Dashboard'
import HomePage from '@/pages/Home'
import LoginPage from '@/pages/Login'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
