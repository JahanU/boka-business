import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/contexts/AuthContext";
import type { Appointment } from "@/types";
import { Loader2, Calendar, Clock, User, Phone, Mail, Trash2, Scissors, History, XCircle } from "lucide-react";
import { format, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingsPage() {
	const { business, staff } = useAuth();
	const [bookings, setBookings] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBookings = async () => {
			if (!business?.id) return;

			setLoading(true);
			const data = await appointmentService.getByBusinessId(business.id);
			setBookings(data);
			console.log(data);
			setLoading(false);
		};

		fetchBookings();
	}, [business?.id]);

	const { upcomingBookings, pastBookings, cancelledBookings } = useMemo(() => {
		const now = new Date();
		return bookings.reduce(
			(acc, booking) => {
				console.info(booking.status);
				if (booking.status === 'cancelled' || booking.status === 'expired') {
					acc.cancelledBookings.push(booking);
					return acc;
				}
				const bookingDateTime = new Date(`${booking.appointment_date}T${booking.appointment_time}`);
				if (isBefore(bookingDateTime, now)) {
					acc.pastBookings.push(booking);
				} else {
					acc.upcomingBookings.push(booking);
				}
				return acc;
			},
			{ upcomingBookings: [] as Appointment[], pastBookings: [] as Appointment[], cancelledBookings: [] as Appointment[] }
		);
	}, [bookings]);

	const handleDelete = async (appointment: Appointment) => {
		if (!confirm('Are you sure you want to delete this booking?')) return;

		const success = await appointmentService.cancel(appointment, staff!.email, business!.name);
		if (success) {
			setBookings(prev => prev.map(b => b.id === appointment.id ? { ...b, status: 'cancelled' } : b));
		} else {
			alert('Failed to delete booking. Please try again.');
		}
	};

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center" role="status">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const renderBookingList = (list: Appointment[], type: 'upcoming' | 'past' | 'cancelled') => {
		if (list.length === 0) {
			return (
				<div className="rounded-xl border border-dashed border-muted p-12 text-center bg-muted/20">
					<div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
						{type === 'upcoming' ? (
							<Calendar className="h-6 w-6 text-muted-foreground" />
						) : type === 'past' ? (
							<History className="h-6 w-6 text-muted-foreground" />
						) : (
							<XCircle className="h-6 w-6 text-muted-foreground" />
						)}
					</div>
					<h3 className="text-lg font-medium mb-1">No {type} bookings found</h3>
					<p className="text-sm text-muted-foreground max-w-xs mx-auto">
						{type === 'upcoming'
							? "When customers book appointments, they will appear here."
							: type === 'past'
								? "Appointment history will appear here once it's in the past."
								: "Cancelled appointments will appear here."}
					</p>
				</div>
			);
		}

		return (
			<div className="grid gap-4">
				{[...list]
					.sort((a, b) => {
						const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
						const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
						return type === 'upcoming'
							? dateA.getTime() - dateB.getTime()
							: dateB.getTime() - dateA.getTime();
					})
					.map((booking) => (
						<div
							key={booking.id}
							className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border bg-background transition-all hover:shadow-md hover:border-primary/20 ${type === 'past' ? 'opacity-70 grayscale-[0.2] bg-muted/30' : type === 'cancelled' ? 'opacity-70 border-destructive/20 bg-destructive/5' : ''
								}`}
						>
							<div className="space-y-3 flex-1">
								<div className="space-y-2">
									<div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
										<Scissors className="h-4 w-4 flex-shrink-0" />
										<span className="truncate">{booking.service_name || 'Standard Service'}</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<div className="text-lg font-bold text-foreground">
											£{Number(booking.service_price).toFixed(2)}
										</div>
										<Badge variant={booking.payment_status === 'paid_online' ? 'info' : 'secondary'} className="text-[10px] h-5 uppercase flex-shrink-0">
											{booking.payment_status?.replaceAll('_', ' ')}
										</Badge>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-4 w-4 text-primary/60" />
										<span className="font-medium text-foreground">
											{format(new Date(booking.appointment_date), 'EEEE, MMM d, yyyy')}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Clock className="h-4 w-4 text-primary/60" />
										<span className="font-medium text-foreground">
											{booking.appointment_time.slice(0, 5)}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground col-span-full">
										<User className="h-4 w-4 text-primary/60" />
										<span className="font-medium text-foreground">
											{booking.customer_name || 'Anonymous Guest'}
										</span>
									</div>
								</div>

								{(booking.customer_phone || booking.customer_email) && (
									<div className="flex flex-wrap gap-4 pt-1 border-t border-muted/50 mt-2">
										{booking.customer_phone && (
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
												<Phone className="h-3 w-3" />
												{booking.customer_phone}
											</div>
										)}
										{booking.customer_email && (
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
												<Mail className="h-3 w-3" />
												{booking.customer_email}
											</div>
										)}
									</div>
								)}
							</div>

							<div className="flex items-center gap-2 md:pl-4 md:border-l md:border-muted/50">
								{type === 'upcoming' && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(booking)}
										className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					))}
			</div>
		);
	};

	return (
		<div className="space-y-6 max-w-5xl mx-auto">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
					<p className="text-muted-foreground">Manage your upcoming appointments and history.</p>
				</div>
			</div>

			<Tabs defaultValue="upcoming" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="upcoming">Upcoming</TabsTrigger>
					<TabsTrigger value="past">Past</TabsTrigger>
					<TabsTrigger value="cancelled">Cancelled</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming">
					<Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle>Upcoming Bookings</CardTitle>
							<CardDescription>Your schedule for the coming days.</CardDescription>
						</CardHeader>
						<CardContent>
							{renderBookingList(upcomingBookings, 'upcoming')}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="past">
					<Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle>Booking History</CardTitle>
							<CardDescription>View your past appointments.</CardDescription>
						</CardHeader>
						<CardContent>
							{renderBookingList(pastBookings, 'past')}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="cancelled">
					<Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle>Cancelled Bookings</CardTitle>
							<CardDescription>Appointments that have been cancelled.</CardDescription>
						</CardHeader>
						<CardContent>
							{renderBookingList(cancelledBookings, 'cancelled')}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
