import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Card, Text, Button, Dialog, Portal, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, isBefore } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentService } from '@boka/shared/services/appointmentService';
import type { Appointment } from '@boka/shared/types';
import { ScreenBackground } from '@/components/ScreenBackground';

type BookingTab = 'upcoming' | 'past' | 'cancelled';

const TAB_CONFIG: { key: BookingTab; label: string }[] = [
	{ key: 'upcoming', label: 'Upcoming' },
	{ key: 'past', label: 'Past' },
	{ key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
	const { business, staff } = useAuth();
	const theme = useTheme();
	const [bookings, setBookings] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<BookingTab>('upcoming');
	const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
	const [dialogVisible, setDialogVisible] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchBookings = async () => {
			if (!business?.id) return;
			setLoading(true);
			const data = await appointmentService.getByBusinessId(business.id);
			setBookings(data);
			setLoading(false);
		};
		fetchBookings();
	}, [business?.id]);

	const { upcomingBookings, pastBookings, cancelledBookings } = useMemo(() => {
		const now = new Date();
		return bookings.reduce(
			(acc, booking) => {
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
			{
				upcomingBookings: [] as Appointment[],
				pastBookings: [] as Appointment[],
				cancelledBookings: [] as Appointment[],
			}
		);
	}, [bookings]);

	const lists: Record<BookingTab, Appointment[]> = {
		upcoming: upcomingBookings,
		past: pastBookings,
		cancelled: cancelledBookings,
	};

	const currentList = lists[tab];

	const sortedList = useMemo(() => {
		return [...currentList].sort((a, b) => {
			const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
			const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
			return tab === 'upcoming' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
		});
	}, [currentList, tab]);

	const showCancelDialog = (booking: Appointment) => {
		setSelectedBooking(booking);
		setDialogVisible(true);
	};

	const handleCancel = async () => {
		if (!selectedBooking || !staff || !business) return;
		setDialogVisible(false);
		const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
		const success = await appointmentService.cancel(
			selectedBooking,
			staff.email,
			business.name,
			apiBaseUrl ? { apiBaseUrl } : undefined
		);
		if (success) {
			setBookings((prev) =>
				prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b))
			);
			setMessage('Booking cancelled.');
		} else {
			setMessage('Failed to cancel booking.');
		}
		setSelectedBooking(null);
	};

	const renderEmpty = () => (
		<View style={styles.emptyCard}>
			<View style={styles.emptyIconCircle}>
				<Ionicons
					name={tab === 'upcoming' ? 'calendar-outline' : tab === 'past' ? 'time-outline' : 'close-circle-outline'}
					size={28}
					color={theme.colors.onSurfaceVariant}
				/>
			</View>
			<Text variant="bodyLarge" style={{ color: theme.colors.onBackground, fontWeight: '600', marginBottom: 4 }}>
				No {tab} bookings found
			</Text>
			<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', maxWidth: 260 }}>
				{tab === 'upcoming'
					? 'When customers book appointments, they will appear here.'
					: tab === 'past'
						? 'Appointment history will appear here once it is in the past.'
						: 'Cancelled appointments will appear here.'}
			</Text>
		</View>
	);

	const renderItem = ({ item }: { item: Appointment }) => {
		const isPast = tab === 'past';
		const isCancelled = tab === 'cancelled';
		return (
			<Card
				style={[
					styles.bookingCard,
					isPast && styles.pastCard,
					isCancelled && styles.cancelledCard,
				]}
			>
				<Card.Content>
					<View style={styles.rowBetween}>
						<View style={styles.row}>
							<Ionicons name="cut-outline" size={18} color={theme.colors.primary} />
							<Text
								variant="bodyMedium"
								style={{ fontWeight: '600', marginLeft: 8, color: theme.colors.primary, flexShrink: 1 }}
								numberOfLines={1}
							>
								{item.service_name || 'Standard Service'}
							</Text>
						</View>
						<Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
							£{Number(item.service_price).toFixed(2)}
						</Text>
					</View>

					<View style={styles.detailGrid}>
						<View style={styles.row}>
							<Ionicons name="calendar-outline" size={14} color={theme.colors.primary} style={{ opacity: 0.6 }} />
							<Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onBackground, fontWeight: '500' }}>
								{format(new Date(item.appointment_date), 'EEEE, MMM d, yyyy')}
							</Text>
						</View>
						<View style={styles.row}>
							<Ionicons name="time-outline" size={14} color={theme.colors.primary} style={{ opacity: 0.6 }} />
							<Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onBackground, fontWeight: '500' }}>
								{item.appointment_time.slice(0, 5)}
							</Text>
						</View>
						<View style={styles.row}>
							<Ionicons name="person-outline" size={14} color={theme.colors.primary} style={{ opacity: 0.6 }} />
							<Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onBackground, fontWeight: '500' }}>
								{item.customer_name || 'Anonymous Guest'}
							</Text>
						</View>
					</View>

					{(item.customer_phone || item.customer_email) && (
						<View style={styles.contactRow}>
							{item.customer_phone && (
								<View style={styles.row}>
									<Ionicons name="call-outline" size={12} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
										{item.customer_phone}
									</Text>
								</View>
							)}
							{item.customer_email && (
								<View style={styles.row}>
									<Ionicons name="mail-outline" size={12} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}>
										{item.customer_email}
									</Text>
								</View>
							)}
						</View>
					)}

					{tab === 'upcoming' && (
						<Button
							mode="outlined"
							onPress={() => showCancelDialog(item)}
							style={{ marginTop: 14, borderColor: theme.colors.error }}
							textColor={theme.colors.error}
						>
							Cancel booking
						</Button>
					)}
				</Card.Content>
			</Card>
		);
	};

	return (
		<ScreenBackground>
			<View style={styles.container}>
				<Text variant="headlineMedium" style={styles.title}>
					Bookings
				</Text>
				<Text variant="bodyMedium" style={styles.subtitle}>
					Manage your upcoming appointments and history.
				</Text>

				<View style={styles.tabBar}>
					{TAB_CONFIG.map((t) => {
						const active = tab === t.key;
						return (
							<Button
								key={t.key}
								mode={active ? 'contained' : 'text'}
								onPress={() => setTab(t.key)}
								style={[styles.tabButton, active && styles.tabButtonActive]}
								labelStyle={styles.tabLabel}
								buttonColor={active ? theme.colors.background : 'transparent'}
								textColor={active ? theme.colors.onBackground : theme.colors.onSurfaceVariant}
								compact
							>
								{t.label}
							</Button>
						);
						})}
				</View>

				{message && (
					<Text style={{ color: theme.colors.primary, marginBottom: 12 }}>{message}</Text>
				)}

				<FlatList
					data={sortedList}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={{ paddingBottom: 24 }}
					ListEmptyComponent={!loading ? renderEmpty : null}
				/>

				<Portal>
					<Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
						<Dialog.Title>Cancel booking?</Dialog.Title>
						<Dialog.Content>
							<Text variant="bodyMedium">
								Are you sure you want to cancel this booking?
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={() => setDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>
								No
							</Button>
							<Button onPress={handleCancel} textColor={theme.colors.error}>
								Yes, cancel
							</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			</View>
		</ScreenBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontWeight: '700',
		fontSize: 30,
		lineHeight: 36,
	},
	subtitle: {
		color: '#8fa4b8',
		fontSize: 15,
		lineHeight: 22,
		marginTop: 4,
		marginBottom: 20,
	},
	tabBar: {
		flexDirection: 'row',
		backgroundColor: '#1e2a38',
		borderRadius: 12,
		padding: 4,
		marginBottom: 16,
	},
	tabButton: {
		flex: 1,
		borderRadius: 10,
	},
	tabButtonActive: {
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.2,
				shadowRadius: 2,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	tabLabel: {
		fontSize: 13,
		fontWeight: '600',
		marginVertical: 6,
	},
	bookingCard: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
		marginBottom: 12,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.12,
				shadowRadius: 8,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	pastCard: {
		opacity: 0.75,
		backgroundColor: '#1e2a38',
	},
	cancelledCard: {
		opacity: 0.8,
		borderColor: 'rgba(239, 68, 68, 0.35)',
		backgroundColor: 'rgba(239, 68, 68, 0.06)',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rowBetween: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14,
	},
	detailGrid: {
		gap: 8,
		marginBottom: 12,
	},
	contactRow: {
		flexDirection: 'row',
		gap: 16,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.08)',
	},
	emptyCard: {
		borderRadius: 16,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#3a4f64',
		backgroundColor: 'rgba(30, 42, 56, 0.4)',
		padding: 32,
		alignItems: 'center',
		marginTop: 12,
	},
	emptyIconCircle: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: '#1e2a38',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	dialog: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
	},
});
