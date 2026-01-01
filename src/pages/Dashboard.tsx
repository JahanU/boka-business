import { useState } from "react";

import { Button } from "@/components/ui/button";


// const stats = [
// 	{ label: "Today’s bookings", value: "18", trend: "+3 vs. yesterday" },
// 	{ label: "Pending payments", value: "$1,240", trend: "4 invoices" },
// 	{ label: "Returning clients", value: "64%", trend: "steady" },
// ];

const tabs = [
	{
		id: "timeline",
		title: "Timeline",
		description: "Weekly booking pace and conversion cadence.",
		content: (
			<div className="space-y-4 text-sm text-muted-foreground">
				<p>
					<strong>Morning rush</strong> is filling faster than last week. Prioritize the
					buffet of appointments from 9–11am.
				</p>
				<p>
					<strong>Evening slots</strong> are still available on Thursday and Friday. Consider
					sending a reminder or special offer to returning clients.
				</p>
			</div>
		),
	},
	{
		id: "payments",
		title: "Payments",
		description: "Track payouts, tips, and online checkouts.",
		content: (
			<div className="space-y-4 text-sm text-muted-foreground">
				<p>
					Online card payments cleared this morning; sweep them into your barber account.
				</p>
				<p>
					<em>Tip of the day:</em> remind clients to pay via the app so the team sees realtime
					status.
				</p>
			</div>
		),
	},
	{
		id: "team",
		title: "Team",
		description: "Availability and staff notes for the week.",
		content: (
			<div className="space-y-4 text-sm text-muted-foreground">
				<p>Riley is booked out Friday, but Monday still has a few gaps.</p>
				<p>Logan will cover the late shift on Tuesday; remind clients to book the premium chair.</p>
			</div>
		),
	},
];

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState(tabs[0].id);
	// const activeContent = useMemo(() => tabs.find((tab) => tab.id === activeTab)!, [activeTab]);

	return (
		<div className="space-y-10">
			<div className="space-y-2 rounded-2xl border border-border bg-card p-8 shadow-lg">
				<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Staff dashboard</p>
				<h1 className="text-4xl font-semibold text-foreground">Ali's Barber</h1>
				<p className="text-base text-muted-foreground">
					Tailor each shift with the context your staff needs. Use the tabs below to cycle through
					booking highlights, payments, and team notes.
				</p>

				<div className="flex flex-wrap gap-2 pt-4">
					{tabs.map((tab) => (
						<Button
							key={tab.id}
							size="sm"
							variant={activeTab === tab.id ? "primary" : "secondary"}
							className="transition"
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.title}
						</Button>
					))}
				</div>
			</div>

			{/* <div className="space-y-6">
				<div className="grid gap-6 md:grid-cols-3">
					{stats.map(({ label, value, trend }) => (
						<Card key={label} className="bg-background/70">
							<CardHeader className="space-y-2">
								<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
									{label}
								</p>
								<CardTitle className="text-3xl">{value}</CardTitle>
								<CardDescription>{trend}</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>

				<Card className="overflow-hidden">
					<CardHeader className="space-y-2 rounded-b-none border-b border-border bg-background/60 px-6 py-4">
						<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
							{activeContent.title}
						</p>
						<CardTitle className="text-2xl">{activeContent.title}</CardTitle>
						<CardDescription>{activeContent.description}</CardDescription>
					</CardHeader>

					<CardContent className="px-6 py-6 space-y-4 text-sm">
						{activeContent.content}
					</CardContent>
				</Card>
			</div> */}
		</div>
	);
}
