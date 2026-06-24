import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface WeeklyRevenueChartProps {
	dailyRevenue: Array<{ date: string; revenue: number }>;
}

const chartConfig = {
	revenue: {
		label: 'Revenue',
		color: 'hsl(var(--primary))',
	},
};

export default function WeeklyRevenueChart({ dailyRevenue }: WeeklyRevenueChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>7-Day Revenue</CardTitle>
				<CardDescription>Daily revenue for the past week</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="aspect-auto h-[200px]">
					<BarChart data={dailyRevenue}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => `£${value}`}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
