import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
				<p className="text-muted-foreground">Manage your business profile and preferences.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Business Information</CardTitle>
					<CardDescription>Update your public profile and contact details.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-dashed border-muted p-8 text-center text-sm text-muted-foreground">
						Settings configuration will be available here.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
