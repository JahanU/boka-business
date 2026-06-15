import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { availabilityService } from '@boka/shared/services/availabilityService';
import type { StaffAvailability } from '@boka/shared/types';

type MarkedDates = Record<string, { color?: string; textColor?: string; startingDay?: boolean; endingDay?: boolean }>;

interface AnnualLeaveProps {
	staffId: string;
	availability: StaffAvailability[];
	onUpdate: () => void;
}

function getDatesInRange(start: string, end: string): string[] {
	const dates: string[] = [];
	const current = new Date(start + 'T00:00:00');
	const last = new Date(end + 'T00:00:00');
	while (current <= last) {
		dates.push(current.toISOString().split('T')[0]);
		current.setDate(current.getDate() + 1);
	}
	return dates;
}

export function AnnualLeave({ staffId, availability, onUpdate }: AnnualLeaveProps) {
	const theme = useTheme();
	const [startDate, setStartDate] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const markedDates = (): MarkedDates => {
		const marks: MarkedDates = {};

		availability.forEach((entry) => {
			if (!entry.specific_date) return;
			const end = entry.end_date || entry.specific_date;
			const dates = getDatesInRange(entry.specific_date, end);
			dates.forEach((date, index) => {
				marks[date] = {
					color: theme.colors.error,
					textColor: '#fff',
					startingDay: index === 0,
					endingDay: index === dates.length - 1,
				};
			});
		});

		if (startDate) {
			marks[startDate] = {
				...marks[startDate],
				color: theme.colors.primary,
				textColor: '#fff',
				startingDay: true,
			};
		}
		if (endDate) {
			marks[endDate] = {
				...marks[endDate],
				color: theme.colors.primary,
				textColor: '#fff',
				endingDay: true,
			};
			if (startDate) {
				const between = getDatesInRange(startDate, endDate);
				between.forEach((date) => {
					if (date === startDate || date === endDate) return;
					marks[date] = { ...marks[date], color: theme.colors.primary };
				});
			}
		}

		return marks;
	};

	const handleDayPress = (day: DateData) => {
		if (!startDate || (startDate && endDate)) {
			setStartDate(day.dateString);
			setEndDate(null);
		} else {
			if (day.dateString < startDate) {
				setStartDate(day.dateString);
				setEndDate(null);
			} else {
				setEndDate(day.dateString);
			}
		}
	};

	const handleAdd = async () => {
		if (!startDate) return;
		setSaving(true);
		setMessage(null);
		try {
			await availabilityService.create(staffId, {
				availability_type: 'annual_leave',
				specific_date: startDate,
				end_date: endDate || startDate,
				is_recurring: false,
			});
			setStartDate(null);
			setEndDate(null);
			onUpdate();
		} catch (error) {
			console.error('Error adding annual leave:', error);
			setMessage('Failed to add annual leave.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		const success = await availabilityService.delete(id);
		if (success) {
			onUpdate();
		} else {
			setMessage('Failed to delete entry.');
		}
	};

	return (
		<View style={{ gap: 16 }}>
			<Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
				Annual Leave
			</Text>
			<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
				Mark dates when you will be fully unavailable.
			</Text>

			{availability.length === 0 ? (
				<View style={styles.emptyCard}>
					<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
						No annual leave entries found.
					</Text>
				</View>
			) : (
				availability.map((entry) => (
					<View key={entry.id} style={styles.leaveRow}>
						<View style={styles.leaveIconCircle}>
							<Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
						</View>
						<View style={{ flex: 1 }}>
							<Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
								{entry.specific_date === entry.end_date || !entry.end_date
									? entry.specific_date
									: `${entry.specific_date} to ${entry.end_date}`}
							</Text>
							<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
								Unavailable all day
							</Text>
						</View>
						<Button
							mode="text"
							textColor={theme.colors.error}
							onPress={() => handleDelete(entry.id)}
							compact
						>
							Delete
						</Button>
					</View>
				))
			)}

			<Calendar
				onDayPress={handleDayPress}
				markedDates={markedDates()}
				markingType="period"
				theme={{
					calendarBackground: '#151d27',
					dayTextColor: theme.colors.onSurface,
					monthTextColor: theme.colors.onSurface,
					arrowColor: theme.colors.primary,
					textSectionTitleColor: theme.colors.onSurfaceVariant,
					todayTextColor: theme.colors.primary,
				}}
				style={styles.calendar}
			/>

			{startDate && (
				<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
					Selected: {startDate} {endDate ? `to ${endDate}` : '(select end date)'}
				</Text>
			)}

			{message && <Text style={{ color: theme.colors.error }}>{message}</Text>}

			<Button
				mode="contained"
				onPress={handleAdd}
				disabled={saving || !startDate}
				loading={saving}
				buttonColor={theme.colors.primary}
				style={{ borderRadius: 10 }}
			>
				Save Leave
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	emptyCard: {
		borderRadius: 12,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#3a4f64',
		backgroundColor: 'rgba(30, 42, 56, 0.4)',
		padding: 20,
		alignItems: 'center',
	},
	leaveRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#151d27',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#3a4f64',
		padding: 12,
		marginBottom: 8,
	},
	leaveIconCircle: {
		width: 40,
		height: 40,
		borderRadius: 10,
		backgroundColor: 'rgba(43, 139, 247, 0.12)',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	calendar: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#3a4f64',
		overflow: 'hidden',
	},
});
