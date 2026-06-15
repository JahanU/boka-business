import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Button, useTheme } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { availabilityService } from '@boka/shared/services/availabilityService';
import { DAY_NAMES } from '@boka/shared/types';
import type { StaffAvailability } from '@boka/shared/types';

interface DaySchedule {
	enabled: boolean;
	start_time: string;
	end_time: string;
	id?: string;
}

interface WeeklyScheduleProps {
	staffId: string;
	availability: StaffAvailability[];
	onUpdate: () => void;
}

function timeToDate(time: string): Date {
	const [hours, minutes] = time.split(':').map(Number);
	const date = new Date();
	date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
	return date;
}

function dateToTime(date: Date): string {
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

export function WeeklySchedule({ staffId, availability, onUpdate }: WeeklyScheduleProps) {
	const theme = useTheme();
	const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({});
	const [saving, setSaving] = useState(false);
	const [picker, setPicker] = useState<{ dayIndex: number; field: 'start_time' | 'end_time' } | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const getInitialSchedule = useCallback(() => {
		const initial: Record<number, DaySchedule> = {};
		for (let i = 0; i < 7; i++) {
			const existing = availability.find((a) => a.day_of_week === i);
			initial[i] = {
				enabled: !!existing,
				start_time: existing?.start_time || '09:00',
				end_time: existing?.end_time || '17:00',
				id: existing?.id,
			};
		}
		return initial;
	}, [availability]);

	useEffect(() => {
		setSchedule(getInitialSchedule());
	}, [getInitialSchedule]);

	const toggleDay = (dayIndex: number) => {
		setSchedule((prev) => ({
			...prev,
			[dayIndex]: { ...prev[dayIndex], enabled: !prev[dayIndex].enabled },
		}));
	};

	const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time') => (event: DateTimePickerEvent, selectedDate?: Date) => {
		setPicker(null);
		if (selectedDate) {
			setSchedule((prev) => ({
				...prev,
				[dayIndex]: { ...prev[dayIndex], [field]: dateToTime(selectedDate) },
			}));
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);

		try {
			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const day = schedule[dayIndex];
				if (!day) continue;

				if (day.enabled) {
					const isValid = await availabilityService.validateNoConflict(
						staffId,
						dayIndex,
						undefined,
						day.start_time,
						day.end_time,
						day.id
					);
					if (!isValid) {
						setMessage(`Time conflict detected for ${DAY_NAMES[dayIndex]}`);
						setSaving(false);
						return;
					}

					if (day.id) {
						await availabilityService.update(day.id, {
							start_time: day.start_time,
							end_time: day.end_time,
							availability_type: 'working_hours',
							is_recurring: true,
						});
					} else {
						await availabilityService.create(staffId, {
							availability_type: 'working_hours',
							day_of_week: dayIndex,
							start_time: day.start_time,
							end_time: day.end_time,
							is_recurring: true,
						});
					}
				} else if (day.id) {
					await availabilityService.delete(day.id);
				}
			}
			setMessage('Schedule saved.');
			onUpdate();
		} catch (error) {
			console.error('Error saving schedule:', error);
			setMessage('Failed to save schedule. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const displayTime = (time: string) => time.slice(0, 5);

	return (
		<View style={{ gap: 12 }}>
			{DAY_NAMES.map((dayName, dayIndex) => (
				<View key={dayIndex} style={styles.dayCard}>
					<View style={styles.dayHeader}>
						<View style={styles.dayLabel}>
							<Switch
								value={schedule[dayIndex]?.enabled ?? false}
								onValueChange={() => toggleDay(dayIndex)}
								color={theme.colors.primary}
							/>
							<Text variant="bodyLarge" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
								{dayName}
							</Text>
						</View>

						{!schedule[dayIndex]?.enabled && (
							<Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
								Unavailable
							</Text>
						)}
					</View>

					{schedule[dayIndex]?.enabled && (
						<View style={styles.timeRow}>
							<View style={styles.timeBlock}>
								<Text variant="bodySmall" style={styles.timeLabel}>
									FROM
								</Text>
								<Button
									mode="outlined"
									compact
									onPress={() => setPicker({ dayIndex, field: 'start_time' })}
									style={styles.timeButton}
									labelStyle={{ color: theme.colors.onBackground, fontSize: 13 }}
								>
									{displayTime(schedule[dayIndex].start_time)}
								</Button>
							</View>
							<Text style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600', marginBottom: 14 }}>
								–
							</Text>
							<View style={styles.timeBlock}>
								<Text variant="bodySmall" style={styles.timeLabel}>
									TO
								</Text>
								<Button
									mode="outlined"
									compact
									onPress={() => setPicker({ dayIndex, field: 'end_time' })}
									style={styles.timeButton}
									labelStyle={{ color: theme.colors.onBackground, fontSize: 13 }}
								>
									{displayTime(schedule[dayIndex].end_time)}
								</Button>
							</View>
						</View>
					)}

					{picker?.dayIndex === dayIndex && picker?.field && (
						<DateTimePicker
							value={timeToDate(schedule[dayIndex][picker.field])}
							mode="time"
							is24Hour
							display="default"
							onChange={handleTimeChange(dayIndex, picker.field)}
						/>
					)}
				</View>
			))}

			{message && (
				<Text
					style={{
						color:
							message.includes('conflict') || message.includes('Failed')
								? theme.colors.error
								: theme.colors.primary,
						marginTop: 4,
					}}
				>
					{message}
				</Text>
			)}

			<Button
				mode="contained"
				onPress={handleSave}
				loading={saving}
				disabled={saving}
				style={{ marginTop: 8, borderRadius: 10 }}
				buttonColor={theme.colors.primary}
			>
				Save Weekly Schedule
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	dayCard: {
		backgroundColor: '#151d27',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#3a4f64',
		padding: 14,
		marginBottom: 8,
	},
	dayHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	dayLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	timeRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 10,
		paddingTop: 6,
	},
	timeBlock: {
		flex: 1,
		gap: 4,
	},
	timeLabel: {
		color: '#8fa4b8',
		fontSize: 10,
		letterSpacing: 0.8,
		fontWeight: '600',
	},
	timeButton: {
		borderColor: '#3a4f64',
		borderRadius: 8,
	},
});
