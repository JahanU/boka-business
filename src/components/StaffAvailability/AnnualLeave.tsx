import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { availabilityService } from '@/services/availabilityService';
import { isDemoMode } from '@/lib/demo';
import type { StaffAvailability } from '@/types';
import { Loader2, Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface AnnualLeaveProps {
	staffId: string;
	availability: StaffAvailability[];
	onUpdate: () => void;
	loading: boolean;
}

export function AnnualLeave({ staffId, availability, onUpdate, loading }: AnnualLeaveProps) {
	const [isAdding, setIsAdding] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [saving, setSaving] = useState(false);

	const handleAdd = async () => {
		if (!dateRange?.from) {
			return;
		}

		// Demo mode: allow date selection but don't persist anything.
		if (isDemoMode()) {
			return;
		}

		setSaving(true);

		try {
			// In our simplified logic, we store annual leave as entries
			// If it's a range, we'll store the start date as specific_date and end date as end_date
			await availabilityService.create(staffId, {
				availability_type: 'annual_leave',
				specific_date: dateRange.from.toISOString().split('T')[0],
				end_date: dateRange.to ? dateRange.to.toISOString().split('T')[0] : dateRange.from.toISOString().split('T')[0],
				is_recurring: false,
			});

			setDateRange(undefined);
			setIsAdding(false);
			onUpdate();
		} catch (error) {
			console.error('Error adding annual leave:', error);
			alert('Failed to add annual leave. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		// Demo mode: delete buttons are no-ops.
		if (isDemoMode()) {
			return;
		}

		if (!confirm('Are you sure you want to delete this leave entry?')) return;

		const success = await availabilityService.delete(id);
		if (success) {
			onUpdate();
		} else {
			alert('Failed to delete entry. Please try again.');
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8" role="status">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold tracking-tight">Annual Leave</h3>
				<p className="text-sm text-muted-foreground">Mark dates when you will be fully unavailable.</p>
			</div>

			<div className="grid gap-3">
				{availability.length === 0 ? (
					<div className="rounded-xl border border-dashed p-8 text-center bg-muted/30">
						<p className="text-sm text-muted-foreground">No annual leave entries found.</p>
					</div>
				) : (
					availability.map((entry) => (
						<div key={entry.id} className="flex items-center justify-between rounded-xl border p-4 bg-background shadow-sm hover:shadow-md transition-shadow">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg">
									<CalendarIcon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<div className="font-semibold text-sm">
										{entry.specific_date === entry.end_date || !entry.end_date
											? entry.specific_date
											: `${entry.specific_date} to ${entry.end_date}`}
									</div>
									<div className="text-xs text-muted-foreground">Unavailable all day</div>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleDelete(entry.id)}
								className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
								title={isDemoMode() ? 'Demo mode — changes are not saved' : 'Delete leave entry'}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))
				)}
			</div>

			{!isAdding ? (
				<Button onClick={() => setIsAdding(true)} variant="outline" title={isDemoMode() ? 'Demo mode — changes are not saved' : 'Add annual leave range'} className="w-full h-11 rounded-xl glassmorphism-effect">
					<Plus className="mr-2 h-4 w-4" />
					Add Annual Leave Range
				</Button>
			) : (
				<div className="space-y-4 rounded-xl border p-5 bg-muted/20 animate-in fade-in zoom-in duration-200">
					<div className="space-y-2">
						<Label className="text-sm font-semibold">Select Leave Dates</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal h-11 rounded-lg",
										!dateRange && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{format(dateRange.from, "LLL dd, y")} -{" "}
												{format(dateRange.to, "LLL dd, y")}
											</>
										) : (
											format(dateRange.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={setDateRange}
									numberOfMonths={1}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="flex gap-2 pt-2">
						<Button onClick={handleAdd} disabled={saving || !dateRange?.from} title={isDemoMode() ? 'Demo mode — changes are not saved' : 'Save leave dates'} className="flex-1 h-11 rounded-lg">
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Save Leave
						</Button>
						<Button onClick={() => setIsAdding(false)} variant="outline" disabled={saving} className="h-11 rounded-lg px-6">
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
