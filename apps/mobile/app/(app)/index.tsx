import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Card, Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentService } from '@boka/shared/services/appointmentService';
import { calculateDashboardMetrics, DashboardMetrics } from '@boka/shared/dashboardUtils';
import { formatBusinessName } from '@boka/shared/utils';
import { Appointment } from '@boka/shared/types';
import { format, parseISO } from 'date-fns';
import { BarChart } from '@/components/BarChart';
import { ScreenBackground } from '@/components/ScreenBackground';

interface MetricCardProps {
	title: string;
	value: string;
	icon: React.ComponentType<{ size: number; color: string }>;
	subtitle?: React.ReactNode;
}

function MetricCard({ title, value, icon: Icon, subtitle }: MetricCardProps) {
	const theme = useTheme();
	return (
		<Card style={styles.metricCard}>
			<Card.Content>
				<View style={styles.metricHeader}>
					<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
						{title}
					</Text>
					<Icon size={16} color={theme.colors.onSurfaceVariant} />
				</View>
				<Text variant="headlineMedium" style={styles.metricValue}>
					{value}
				</Text>
				{subtitle}
			</Card.Content>
		</Card>
	);
}

export default function DashboardScreen() {
	const { business, loading: authLoading } = useAuth();
	const theme = useTheme();
	const router = useRouter();
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

	const metrics: DashboardMetrics = useMemo(
		() => calculateDashboardMetrics(appointments),
		[appointments]
	);

	if (authLoading || loading) {
		return (
			<ScreenBackground>
				<View style={styles.center}>
					<ActivityIndicator size="large" color={theme.colors.primary} />
				</View>
			</ScreenBackground>
		);
	}

	const chartData = metrics.dailyRevenue.map((day) => ({
		value: day.revenue,
		label: day.date,
	}));

	return (
		<ScreenBackground>
			<ScrollView style={styles.container} contentContainerStyle={styles.content}>
				<View style={styles.header}>
					<Text variant="bodySmall" style={styles.eyebrow}>
						Staff dashboard
					</Text>
					<Text variant="headlineLarge" style={styles.title}>
						{business ? formatBusinessName(business.name) : 'Dashboard'}
					</Text>
					<Text variant="bodyMedium" style={styles.subtitle}>
						Overview of your bookings, revenue, and business insights.
					</Text>
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.metricsScroll}
				>
					<MetricCard
						title="Today's Revenue"
						value={`£${metrics.todayRevenue.toFixed(2)}`}
						icon={({ size, color }) => (
							<MaterialCommunityIcons name="currency-gbp" size={size} color={color} />
						)}
						subtitle={
							<View style={styles.metricSubtitle}>
								<View style={styles.metricLine}>
									<Ionicons name="card-outline" size={12} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
										Online{' '}
										<Text style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
											£{metrics.todayRevenueOnline.toFixed(2)}
										</Text>
									</Text>
								</View>
								<View style={styles.metricLine}>
									<Ionicons name="wallet-outline" size={12} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
										In Store{' '}
										<Text style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
											£{metrics.todayRevenueInStore.toFixed(2)}
										</Text>
									</Text>
								</View>
							</View>
						}
					/>
					<MetricCard
						title="This Week"
						value={`${metrics.weeklyBookingsCount}`}
						icon={({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />}
						subtitle={
							<View style={styles.metricSubtitle}>
								<View style={styles.metricLine}>
									{metrics.weeklyRevenueChange >= 0 ? (
										<Ionicons name="trending-up-outline" size={14} color="#34d399" />
									) : (
										<Ionicons name="trending-down-outline" size={14} color="#f87171" />
									)}
									<Text
										variant="bodySmall"
										style={{ color: metrics.weeklyRevenueChange >= 0 ? '#34d399' : '#f87171', fontWeight: '600' }}
									>
										{metrics.weeklyRevenueChange >= 0 ? '+' : ''}
										{metrics.weeklyRevenueChange.toFixed(1)}%
									</Text>
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
										vs last week
									</Text>
								</View>
								<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
									Revenue:{' '}
									<Text style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
										£{metrics.weeklyRevenue.toFixed(2)}
									</Text>
								</Text>
							</View>
						}
					/>
					<MetricCard
						title="Remaining Today"
						value={`${metrics.upcomingTodayCount}`}
						icon={({ size, color }) => <Ionicons name="time-outline" size={size} color={color} />}
						subtitle={
							<View style={styles.metricSubtitle}>
								{metrics.nextAppointment ? (
									<View>
										<Text variant="bodySmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
											Next:{' '}
											{format(
												parseISO(
													`${metrics.nextAppointment.appointment_date}T${metrics.nextAppointment.appointment_time}`
												),
												'HH:mm'
											)}
										</Text>
										<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
											{metrics.nextAppointment.customer_name || 'Guest'}
										</Text>
									</View>
								) : (
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
										No upcoming appointments
									</Text>
								)}
								<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
									Expected:{' '}
									<Text style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
										£{metrics.upcomingTodayRevenue.toFixed(2)}
									</Text>
								</Text>
							</View>
						}
					/>
				</ScrollView>

				<View style={styles.grid}>
					<Card style={styles.chartCard}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.cardTitle}>
								7-Day Revenue
							</Text>
							<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
								Daily revenue for the past week
							</Text>
							<BarChart
								data={chartData}
								barWidth={22}
								roundedTop
								roundedBottom
								hideRules
								xAxisThickness={1}
								yAxisThickness={1}
								yAxisTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
								xAxisLabelTextStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
								frontColor={theme.colors.primary}
							/>
						</Card.Content>
					</Card>

					<Card style={styles.chartCard}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.cardTitle}>
								Weekly Insights
							</Text>
							<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
								Payment breakdown and popular services
							</Text>

							<Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
								Payment Status
							</Text>
							<View style={styles.insightRow}>
								<View style={styles.row}>
									<Ionicons name="card-outline" size={16} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
										Paid Online
									</Text>
								</View>
								<Text variant="bodySmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
									£{metrics.paymentStatusSummary.paidOnline.toFixed(2)}
								</Text>
							</View>
							<View style={[styles.insightRow, { marginBottom: 16 }]}>
								<View style={styles.row}>
									<Ionicons name="wallet-outline" size={16} color={theme.colors.onSurfaceVariant} />
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
										Pay in Store
									</Text>
								</View>
								<Text variant="bodySmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
									£{metrics.paymentStatusSummary.payInStore.toFixed(2)}
								</Text>
							</View>

							<Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 8 }}>
								Popular Services
							</Text>
							{metrics.popularServices.length > 0 ? (
								metrics.popularServices.map((service, index) => (
									<View key={service.name} style={styles.insightRow}>
										<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
											{index + 1}. {service.name}
										</Text>
										<View style={styles.badge}>
											<Text style={styles.badgeText}>{service.count} bookings</Text>
										</View>
									</View>
								))
								) : (
									<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
										No data available
									</Text>
								)}
						</Card.Content>
					</Card>
				</View>

				<Card style={styles.scheduleCard}>
					<Card.Content>
						<View style={styles.scheduleHeader}>
							<View>
								<Text variant="titleLarge" style={styles.cardTitle}>
									Today's Schedule
								</Text>
								<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
									Upcoming appointments for today
								</Text>
							</View>
							<Button
								onPress={() => router.push('/(app)/bookings')}
								compact
								textColor={theme.colors.primary}
								icon={({ size, color }) => <Ionicons name="arrow-forward" size={size} color={color} />}
							>
								View all
							</Button>
						</View>

						{metrics.todaySchedule.length > 0 ? (
							metrics.todaySchedule.map((apt) => (
								<View key={apt.id} style={styles.scheduleItem}>
									<View style={styles.row}>
										<Text
											variant="bodyMedium"
											style={{ fontWeight: '600', minWidth: 54, color: theme.colors.onBackground }}
										>
											{format(
												parseISO(`${apt.appointment_date}T${apt.appointment_time}`),
												'HH:mm'
											)}
										</Text>
										<View style={{ marginLeft: 12 }}>
											<Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
												{apt.customer_name || 'Guest'}
											</Text>
											<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
												{apt.service_name}
											</Text>
											<Text variant="bodySmall" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>
												£{Number(apt.service_price).toFixed(2)}
											</Text>
										</View>
									</View>
									<View style={styles.badge}>
										<Text style={styles.badgeText}>
											{apt.payment_status === 'paid_online' ? 'Paid' : 'Pay in store'}
										</Text>
									</View>
								</View>
							))
						) : (
							<View style={styles.emptyState}>
								<Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
								<Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
									No appointments scheduled for today
								</Text>
							</View>
						)}
					</Card.Content>
				</Card>
			</ScrollView>
		</ScreenBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		padding: 16,
		paddingBottom: 32,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		gap: 4,
		marginBottom: 20,
	},
	eyebrow: {
		textTransform: 'uppercase',
		letterSpacing: 2.5,
		color: '#4dd9e6',
		fontSize: 11,
	},
	title: {
		fontWeight: '700',
		fontSize: 32,
		lineHeight: 38,
	},
	subtitle: {
		color: '#8fa4b8',
		fontSize: 15,
		lineHeight: 22,
		marginTop: 4,
	},
	metricsScroll: {
		paddingRight: 16,
		gap: 12,
	},
	metricCard: {
		width: 260,
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
		marginRight: 12,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.15,
				shadowRadius: 8,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	metricHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	metricValue: {
		fontWeight: '700',
		fontSize: 28,
		marginBottom: 12,
	},
	metricSubtitle: {
		gap: 6,
	},
	metricLine: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		flexWrap: 'wrap',
	},
	grid: {
		gap: 16,
		marginTop: 16,
	},
	chartCard: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.15,
				shadowRadius: 8,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	cardTitle: {
		fontWeight: '700',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	insightRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	badge: {
		backgroundColor: '#23415e',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	badgeText: {
		fontSize: 11,
		color: '#e8f1f8',
		fontWeight: '600',
	},
	scheduleCard: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
		marginTop: 16,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.15,
				shadowRadius: 8,
			},
			android: {
				elevation: 3,
			},
		}),
	},
	scheduleHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 16,
	},
	scheduleItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#3a4f64',
		marginBottom: 10,
		backgroundColor: '#151d27',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 32,
	},
});
