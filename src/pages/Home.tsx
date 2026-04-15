import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const highlights = [
	{
		title: 'Booking overview',
		description: 'See today’s schedule and upcoming clients at a glance.',
	},
	{
		title: 'Payments',
		description: 'Track payouts and reconcile online payments from bookings.',
	},
	{
		title: 'Staff tools',
		description: 'Assign services, manage availability, and keep shifts aligned.',
	},
];

function HomePage() {
	return (
		<div className="flex flex-col gap-10">
			<section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-10 shadow-sm">
				<div className="pointer-events-none absolute inset-0 opacity-50">
					<div className="absolute inset-y-0 left-1/3 w-72 rounded-full bg-primary/20 blur-3xl" />
					<div className="absolute inset-y-0 right-1/3 w-72 rounded-full bg-accent/30 blur-3xl" />
				</div>
				<div className="relative flex flex-col gap-6">
					<p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
						Boka Businesses
					</p>
					<h1 className="text-4xl font-bold leading-tight sm:text-5xl">
						Manage your business in one place.
					</h1>
					<p className="max-w-2xl text-lg text-muted-foreground">
						A centralized dashboard for staff to view bookings, monitor payments, and keep the team
						aligned. Built to pair with your customer-facing booking site.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<Button asChild size="lg">
							<Link to="/login">Go to staff login</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{highlights.map(({ title, description }) => (
					<Card key={title}>
						<CardHeader>
							<CardTitle>{title}</CardTitle>
							<CardDescription>{description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</section>
		</div>
	);
}

export default HomePage;
