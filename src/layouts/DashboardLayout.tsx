import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '#bookings', label: 'Bookings' },
  { href: '#payments', label: 'Payments' },
  { href: '#settings', label: 'Settings' },
]

export function DashboardLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate()

    const handleSignOut = async () => {
      await signOut();
      navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6 border-r border-border bg-muted/30 p-6">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              B
            </span>
            <div className="leading-tight">
              <div>Boka Businesses</div>
              <p className="text-sm text-muted-foreground">Staff</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-2 text-sm font-medium text-muted-foreground">
            {sidebarLinks.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className="rounded-lg px-3 py-2 transition hover:bg-accent hover:text-accent-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
            Logout
          </Button>
        </aside>

        <main className="flex flex-col gap-6 p-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
              <h1 className="text-3xl font-bold">Welcome back</h1>
            </div>
            <Button>Add booking</Button>
          </header>

          <section className="flex-1">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}
