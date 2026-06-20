import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { availabilityService } from '@/services/availabilityService';
import type { StaffAvailability as IStaffAvailability } from '@/types';
import { WeeklySchedule } from './WeeklySchedule';
import { AnnualLeave } from './AnnualLeave';

export function StaffAvailability() {
	const { staff } = useAuth();
	const [availability, setAvailability] = useState<IStaffAvailability[]>([]);
	const [loading, setLoading] = useState(true);

	const loadAvailability = useCallback(async () => {
		if (!staff?.id) return;

		setLoading(true);
		const data = await availabilityService.getByStaffId(staff.id);
		setAvailability(data || []);
		setLoading(false);
	}, [staff]);

	useEffect(() => {
		const init = async () => {
			if (staff?.id) {
				await loadAvailability();
			}
		};
		init();
	}, [staff, loadAvailability]);

	if (!staff) {
		return (
			<Card className="border-none shadow-none bg-transparent">
				<CardHeader className="px-0">
					<CardTitle>Staff Availability</CardTitle>
					<CardDescription>
						Please log in as a staff member to manage your availability.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="border-none shadow-none bg-transparent">
			<CardHeader className="px-0">
				<CardTitle className="text-2xl font-bold">Manage Availability</CardTitle>
				<CardDescription>
					Set your recurring weekly schedule and one-time leave periods.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-0 mt-2">
				<Tabs defaultValue="schedule" className="w-full">
					<TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto mb-8">
						<TabsTrigger
							value="schedule"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
						>
							Weekly Schedule
						</TabsTrigger>
						<TabsTrigger
							value="leave"
							className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
						>
							Annual Leave
						</TabsTrigger>
					</TabsList>

					<TabsContent value="schedule" className="mt-0 focus-visible:outline-none outline-none ring-0">
						<WeeklySchedule
							key={availability.map((a) => a.id).join(',')}
							staffId={staff.id}
							availability={availability.filter((a) => a.availability_type === 'working_hours')}
							onUpdate={loadAvailability}
							loading={loading}
						/>
					</TabsContent>

					<TabsContent value="leave" className="mt-0 focus-visible:outline-none outline-none ring-0">
						<AnnualLeave
							staffId={staff.id}
							availability={availability.filter((a) => a.availability_type === 'annual_leave')}
							onUpdate={loadAvailability}
							loading={loading}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
