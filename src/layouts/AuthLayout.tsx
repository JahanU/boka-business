import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
]

export function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              B
            </span>
            <div className="leading-tight">
              <div>Boka Businesses</div>
              <p className="text-sm text-muted-foreground">Staff portal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground',
                  pathname === href && 'bg-accent text-accent-foreground',
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
