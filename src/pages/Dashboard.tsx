import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatBusinessName } from "@/lib/utils";
import { appointmentService } from "@/services/appointmentService";
import { calculateDashboardMetrics, DashboardMetrics } from "@/lib/dashboardUtils";
import { Appointment } from "@/types";
import { format, parseISO } from "date-fns";
import {
	TrendingUp,
	TrendingDown,
	Calendar,
	Clock,
	PoundSterling,
	CreditCard,
	Loader2,
	ArrowRight
} from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

export default function DashboardPage() {
	const { business, loading: authLoading } = useAuth();
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAppointments = async () => {
			if (!business?.id) return;
			setLoading(true);
			const data = await appointmentService.getByBusinessId(business.id);
			setAppointments(data);
			setLoading(false);
		};

		fetchAppointments();
	}, [business?.id]);

	const metrics: DashboardMetrics = useMemo(() => {
		return calculateDashboardMetrics(appointments);
	}, [appointments]);

	if (authLoading || loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const chartConfig = {
		revenue: {
			label: "Revenue",
			color: "hsl(var(--primary))",
		},
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Staff dashboard</p>
				<h1 className="text-4xl font-semibold text-foreground">
					{business ? formatBusinessName(business.name) : "Dashboard"}
				</h1>
				<p className="text-base text-muted-foreground">
					Overview of your bookings, revenue, and business insights.
				</p>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				{/* Today's Revenue */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardDescription>Today's Revenue</CardDescription>
							<PoundSterling className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardTitle className="text-3xl">£{metrics.todayRevenue.toFixed(2)}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-xs text-muted-foreground">
							<div className="flex justify-between">
								<span className="flex items-center gap-1">
									<CreditCard className="h-3 w-3" /> Online
								</span>
								<span className="font-medium">£{metrics.todayRevenueOnline.toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* This Week's Bookings */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardDescription>This Week</CardDescription>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardTitle className="text-3xl">{metrics.weeklyBookingsCount}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-xs">
							{metrics.weeklyRevenueChange >= 0 ? (
								<TrendingUp className="h-4 w-4 text-emerald-500" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-500" />
							)}
							<span className={metrics.weeklyRevenueChange >= 0 ? "text-emerald-500" : "text-red-500"}>
								{metrics.weeklyRevenueChange >= 0 ? "+" : ""}
								{metrics.weeklyRevenueChange.toFixed(1)}%
							</span>
							<span className="text-muted-foreground">vs last week</span>
						</div>
						<div className="mt-2 text-xs text-muted-foreground">
							Revenue: £{metrics.weeklyRevenue.toFixed(2)}
						</div>
					</CardContent>
				</Card>

				{/* Upcoming Today */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardDescription>Remaining Today</CardDescription>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</div>
						<CardTitle className="text-3xl">{metrics.upcomingTodayCount}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-xs text-muted-foreground">
							{metrics.nextAppointment ? (
								<div className="space-y-1">
									<div>Next: {format(parseISO(`${metrics.nextAppointment.appointment_date}T${metrics.nextAppointment.appointment_time}`), 'HH:mm')}</div>
									<div className="font-medium text-foreground">{metrics.nextAppointment.customer_name || 'Guest'}</div>
								</div>
							) : (
								<div>No upcoming appointments</div>
							)}
							<div className="mt-2">
								Expected: £{metrics.upcomingTodayRevenue.toFixed(2)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts and Insights Row */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Weekly Revenue Chart */}
				<Card>
					<CardHeader>
						<CardTitle>7-Day Revenue</CardTitle>
						<CardDescription>Daily revenue for the past week</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig} className="aspect-auto h-[200px]">
							<BarChart data={metrics.dailyRevenue}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) => `£${value}`}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar
									dataKey="revenue"
									fill="var(--color-revenue)"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Popular Services */}
				<Card>
					<CardHeader>
						<CardTitle>Weekly Insights</CardTitle>
						<CardDescription>Popular services for the week</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Popular Services */}
						<div>
							<p className="text-sm font-medium mb-2">Popular Services</p>
							<div className="space-y-2">
								{metrics.popularServices.length > 0 ? (
									metrics.popularServices.map((service, index) => (
										<div key={service.name} className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">
												{index + 1}. {service.name}
											</span>
											<Badge variant="secondary" className="text-xs">
												{service.count} bookings
											</Badge>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">No data available</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Today's Schedule */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Today's Schedule</CardTitle>
							<CardDescription>Upcoming appointments for today</CardDescription>
						</div>
						<a
							href="/bookings"
							className="text-sm text-primary hover:underline flex items-center gap-1"
						>
							View all <ArrowRight className="h-4 w-4" />
						</a>
					</div>
				</CardHeader>
				<CardContent>
					{metrics.todaySchedule.length > 0 ? (
						<div className="space-y-3">
							{metrics.todaySchedule.map((apt) => (
								<div
									key={apt.id}
									className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div className="text-sm font-medium min-w-[60px]">
											{format(parseISO(`${apt.appointment_date}T${apt.appointment_time}`), 'HH:mm')}
										</div>
										<div className="space-y-1">
											<div className="text-sm font-medium">{apt.customer_name || 'Guest'}</div>
											<div className="text-xs text-muted-foreground">{apt.service_name}</div>
											<div className="text-sm font-medium">£{Number(apt.service_price).toFixed(2)}</div>

										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
							<p>No appointments scheduled for today</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
