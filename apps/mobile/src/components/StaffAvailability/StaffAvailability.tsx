import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { availabilityService } from '@boka/shared/services/availabilityService';
import type { StaffAvailability as IStaffAvailability } from '@boka/shared/types';
import { WeeklySchedule } from './WeeklySchedule';
import { AnnualLeave } from './AnnualLeave';

type SettingsTab = 'schedule' | 'leave';

const TABS: { key: SettingsTab; label: string }[] = [
	{ key: 'schedule', label: 'Weekly Schedule' },
	{ key: 'leave', label: 'Annual Leave' },
];

export function StaffAvailability() {
	const { staff } = useAuth();
	const theme = useTheme();
	const [availability, setAvailability] = useState<IStaffAvailability[]>([]);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<SettingsTab>('schedule');

	const loadAvailability = useCallback(async () => {
		if (!staff?.id) return;
		setLoading(true);
		const data = await availabilityService.getByStaffId(staff.id);
		setAvailability(data || []);
		setLoading(false);
	}, [staff]);

	useEffect(() => {
		if (staff?.id) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			loadAvailability();
		}
	}, [staff, loadAvailability]);

	if (!staff) {
		return (
			<Card style={styles.card}>
				<Card.Content>
					<Text variant="titleLarge" style={styles.title}>
						Staff Availability
					</Text>
					<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
						Please log in as a staff member to manage your availability.
					</Text>
				</Card.Content>
			</Card>
		);
	}

	return (
		<Card style={styles.card}>
			<Card.Content>
				<Text variant="titleLarge" style={styles.title}>
					Manage Availability
				</Text>
				<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
					Set your recurring weekly schedule and one-time leave periods.
				</Text>

				<View style={styles.tabBar}>
					{TABS.map((t) => {
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

				{loading ? (
					<ActivityIndicator style={{ marginVertical: 24 }} color={theme.colors.primary} />
				) : tab === 'schedule' ? (
					<WeeklySchedule
						staffId={staff.id}
						availability={availability.filter((a) => a.availability_type === 'working_hours')}
						onUpdate={loadAvailability}
					/>
				) : (
					<AnnualLeave
						staffId={staff.id}
						availability={availability.filter((a) => a.availability_type === 'annual_leave')}
						onUpdate={loadAvailability}
					/>
				)}
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#16202b',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#3a4f64',
	},
	title: {
		fontWeight: '700',
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
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},
	tabLabel: {
		fontSize: 12,
		fontWeight: '600',
		marginVertical: 6,
	},
});
