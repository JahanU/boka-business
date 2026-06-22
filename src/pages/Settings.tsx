import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StaffAvailability } from "@/components/StaffAvailability/StaffAvailability";
import { isDemoMode } from "@/lib/demo";

export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
				<p className="text-muted-foreground">Manage your business profile and preferences.</p>
			</div>

			{isDemoMode() && (
				<Card className="border-primary/20 bg-primary/5">
					<CardContent className="py-4">
						<p className="text-sm text-primary font-medium">
							You are viewing the demo. Any changes made here are not saved.
						</p>
					</CardContent>
				</Card>
			)}

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
			<StaffAvailability />
		</div>
	);
}
