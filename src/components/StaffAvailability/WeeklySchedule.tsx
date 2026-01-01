import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TimePicker } from '@/components/ui/time-picker';
import { availabilityService } from '@/services/availabilityService';
import type { StaffAvailability } from '@/types';
import { DAY_NAMES } from '@/types';
import { Loader2, Save } from 'lucide-react';

interface WeeklyScheduleProps {
	staffId: string;
	availability: StaffAvailability[];
	onUpdate: () => void;
	loading: boolean;
}

interface DaySchedule {
	enabled: boolean;
	start_time: string;
	end_time: string;
	id?: string;
}

export function WeeklySchedule({ staffId, availability, onUpdate, loading }: WeeklyScheduleProps) {
	// Helper to transform availability prop to local schedule state
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

	const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(getInitialSchedule);
	const [saving, setSaving] = useState(false);

	// Sync local state when availability data is loaded or updated
	useEffect(() => {
		if (!loading) {
			setSchedule(getInitialSchedule());
		}
	}, [loading, getInitialSchedule]);

	const handleToggleDay = (dayIndex: number) => {
		setSchedule((prev) => ({
			...prev,
			[dayIndex]: {
				...prev[dayIndex],
				enabled: !prev[dayIndex].enabled,
			},
		}));
	};

	const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
		setSchedule((prev) => ({
			...prev,
			[dayIndex]: {
				...prev[dayIndex],
				[field]: value,
			},
		}));
	};

	const handleSave = async () => {
		setSaving(true);

		try {
			// Process each day
			for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
				const day = schedule[dayIndex];

				if (day.enabled) {
					// Validate no conflicts
					const isValid = await availabilityService.validateNoConflict(
						staffId,
						dayIndex,
						undefined,
						day.start_time,
						day.end_time,
						day.id
					);

					if (!isValid) {
						alert(`Time conflict detected for ${DAY_NAMES[dayIndex]}`);
						setSaving(false);
						return;
					}

					// Create or update
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
					// Delete if it exists but is now disabled
					await availabilityService.delete(day.id);
				}
			}

			onUpdate();
		} catch (error) {
			console.error('Error saving schedule:', error);
			alert('Failed to save schedule. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				{DAY_NAMES.map((dayName, dayIndex) => (
					<div key={dayIndex} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border p-4">
						<div className="flex items-center space-x-2 min-w-[140px]">
							<Checkbox
								id={`day-${dayIndex}`}
								checked={schedule[dayIndex].enabled}
								onCheckedChange={() => handleToggleDay(dayIndex)}
							/>
							<Label htmlFor={`day-${dayIndex}`} className="font-medium cursor-pointer">
								{dayName}
							</Label>
						</div>

						{schedule[dayIndex].enabled ? (
							<div className="flex flex-1 items-center gap-3">
								<div className="flex flex-col gap-1.5 flex-1">
									<Label htmlFor={`start-${dayIndex}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
										From
									</Label>
									<TimePicker
										id={`start-${dayIndex}`}
										value={schedule[dayIndex].start_time}
										onChange={(e) => handleTimeChange(dayIndex, 'start_time', e.target.value)}
										className="h-9 focus-visible:ring-primary shadow-sm"
									/>
								</div>

								<div className="flex flex-col gap-1.5 flex-1">
									<Label htmlFor={`end-${dayIndex}`} className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
										To
									</Label>
									<TimePicker
										id={`end-${dayIndex}`}
										value={schedule[dayIndex].end_time}
										onChange={(e) => handleTimeChange(dayIndex, 'end_time', e.target.value)}
										className="h-9 focus-visible:ring-primary shadow-sm"
									/>
								</div>
							</div>
						) : (
							<div className="flex-1 text-sm text-muted-foreground italic py-2">
								Unavailable
							</div>
						)}
					</div>
				))}
			</div>

			<Button onClick={handleSave} disabled={saving} className="w-full shadow-lg hover:shadow-xl transition-shadow py-6 h-auto text-base">
				{saving ? (
					<>
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />
						Saving Schedule...
					</>
				) : (
					<>
						<Save className="mr-2 h-5 w-5" />
						Save Weekly Schedule
					</>
				)}
			</Button>
		</div>
	);
}
