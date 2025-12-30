import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
]

export function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-bold">
              B
            </span>
            <div className="leading-tight">
              <div>Boka Businesses</div>
              <p className="text-sm text-slate-400">Staff portal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition hover:text-indigo-200',
                  pathname === href ? 'bg-indigo-600 text-white' : 'text-slate-300',
                )}
              >
                {label}
              </Link>
            ))}
            <Button asChild size="sm" variant="secondary">
              <Link to="/login">Staff Login</Link>
            </Button>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
