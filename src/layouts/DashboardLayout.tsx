import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationLinks = [
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/bookings', label: 'Bookings', icon: Calendar },
	{ href: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
	const { signOut } = useAuth();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
		navigate('/');
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
					{/* Logo */}
					<NavLink to="/" className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
							B
						</span>
						<span className="font-semibold">Boka Businesses</span>
					</NavLink>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex flex-1 items-center justify-center gap-1">
						{navigationLinks.map(({ href, label, icon: Icon }) => {
							return (
								<NavLink
									key={href}
									to={href}
									end={href === '/dashboard'}
									className={({ isActive }) =>
										cn(
											'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
											isActive
												? 'bg-primary/10 text-primary'
												: 'text-muted-foreground hover:bg-muted hover:text-foreground',
										)
									}
								>
									<Icon className="h-4 w-4" />
									{label}
								</NavLink>
							);
						})}
					</nav>

					{/* Desktop Logout */}
					<div className="hidden md:flex items-center gap-2">
						<Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
							<LogOut className="h-4 w-4" />
							Logout
						</Button>
					</div>

					{/* Mobile - Just Logo and Logout */}
					<div className="md:hidden">
						<Button variant="ghost" size="icon" onClick={handleSignOut}>
							<LogOut className="h-5 w-5" />
							<span className="sr-only">Logout</span>
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 px-4 py-6 md:py-8 pb-20 md:pb-8">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
					<Outlet />
				</div>
			</main>

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-around px-2">
					{navigationLinks.map(({ href, label, icon: Icon }) => {
						return (
							<NavLink
								key={href}
								to={href}
								end={href === '/dashboard'}
								className={({ isActive }) =>
									cn(
										'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] rounded-lg transition-colors',
										isActive ? 'text-primary' : 'text-muted-foreground',
									)
								}
							>
								{({ isActive }) => (
									<>
										<Icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
										<span className="text-xs font-medium">{label}</span>
									</>
								)}
							</NavLink>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
