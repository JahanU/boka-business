import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BookingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
				<p className="text-muted-foreground">Manage your upcoming appointments and history.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Upcoming Bookings</CardTitle>
					<CardDescription>Your schedule for the coming days.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-dashed border-muted p-8 text-center text-sm text-muted-foreground">
						No bookings found. When customers book, they will appear here.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
