import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import DashboardPage from './pages/Dashboard'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
