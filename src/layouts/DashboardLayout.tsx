import { Link, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/button'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '#bookings', label: 'Bookings' },
  { href: '#payments', label: 'Payments' },
  { href: '#settings', label: 'Settings' },
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6 border-r border-slate-800 bg-slate-900/40 p-6">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-bold">
              B
            </span>
            <div className="leading-tight">
              <div>Boka Businesses</div>
              <p className="text-sm text-slate-400">Staff</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-300">
            {sidebarLinks.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="rounded-lg px-3 py-2 transition hover:bg-slate-800 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <Button variant="secondary" size="sm" className="w-full">
            Logout
          </Button>
        </aside>

        <main className="flex flex-col gap-6 p-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
              <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            </div>
            <Button variant="primary">Add booking</Button>
          </header>

          <section className="flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
