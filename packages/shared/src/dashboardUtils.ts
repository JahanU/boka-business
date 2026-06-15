import { Appointment } from './types/index.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, format, parseISO } from 'date-fns';

export interface DashboardMetrics {
    todayRevenue: number;
    todayRevenueOnline: number;
    todayRevenueInStore: number;
    todayBookingsCount: number;
    upcomingTodayCount: number;
    upcomingTodayRevenue: number;
    nextAppointment: Appointment | null;
    weeklyBookingsCount: number;
    weeklyRevenue: number;
    weeklyRevenueChange: number;
    paymentStatusSummary: {
        paidOnline: number;
        payInStore: number;
    };
    popularServices: Array<{ name: string; count: number }>;
    dailyRevenue: Array<{ date: string; revenue: number }>;
    todaySchedule: Appointment[];
}

export function calculateDashboardMetrics(appointments: Appointment[]): DashboardMetrics {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    // Filter appointments
    const todayAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= todayStart && aptDate <= todayEnd;
    });

    const upcomingToday = todayAppointments.filter(apt => {
        const aptDateTime = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
        return aptDateTime > now && (apt.status === 'confirmed' || apt.status === 'pending');
    });

    const weeklyAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= weekStart && aptDate <= weekEnd;
    });

    const lastWeekAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return aptDate >= lastWeekStart && aptDate <= lastWeekEnd;
    });

    // Calculate today's revenue
    const todayRevenue = todayAppointments
        .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
        .reduce((sum, apt) => sum + Number(apt.service_price), 0);

    const todayRevenueOnline = todayAppointments
        .filter(apt => (apt.status === 'completed' || apt.status === 'confirmed') && apt.payment_status === 'paid_online')
        .reduce((sum, apt) => sum + Number(apt.service_price), 0);

    const todayRevenueInStore = todayRevenue - todayRevenueOnline;

    // Calculate weekly metrics
    const weeklyRevenue = weeklyAppointments
        .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
        .reduce((sum, apt) => sum + Number(apt.service_price), 0);

    const lastWeekRevenue = lastWeekAppointments
        .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
        .reduce((sum, apt) => sum + Number(apt.service_price), 0);

    const weeklyRevenueChange = lastWeekRevenue > 0
        ? ((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
        : 0;

    // Payment status summary (for the week)
    const paymentStatusSummary = weeklyAppointments
        .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
        .reduce(
            (acc, apt) => {
                const price = Number(apt.service_price);
                if (apt.payment_status === 'paid_online') {
                    acc.paidOnline += price;
                } else {
                    acc.payInStore += price;
                }
                return acc;
            },
            { paidOnline: 0, payInStore: 0 }
        );

    // Popular services
    const serviceCounts = weeklyAppointments.reduce((acc, apt) => {
        const name = apt.service_name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const popularServices = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    // Daily revenue for the past 7 days
    const dailyRevenue: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayRevenue = appointments
            .filter(apt => {
                const aptDate = parseISO(apt.appointment_date);
                return aptDate >= dayStart && aptDate <= dayEnd && (apt.status === 'completed' || apt.status === 'confirmed');
            })
            .reduce((sum, apt) => sum + Number(apt.service_price), 0);

        dailyRevenue.push({
            date: format(date, 'EEE'),
            revenue: dayRevenue,
        });
    }

    // Next appointment
    const sortedUpcoming = [...upcomingToday].sort((a, b) => {
        const timeA = parseISO(`${a.appointment_date}T${a.appointment_time}`);
        const timeB = parseISO(`${b.appointment_date}T${b.appointment_time}`);
        return timeA.getTime() - timeB.getTime();
    });

    // Today's schedule (sorted by time)
    const todaySchedule = [...todayAppointments]
        .filter(apt => apt.status !== 'cancelled' && apt.status != 'expired')
        .sort((a, b) => {
            const timeA = parseISO(`${a.appointment_date}T${a.appointment_time}`);
            const timeB = parseISO(`${b.appointment_date}T${b.appointment_time}`);
            return timeA.getTime() - timeB.getTime();
        })
        .slice(0, 5);

    return {
        todayRevenue,
        todayRevenueOnline,
        todayRevenueInStore,
        todayBookingsCount: todayAppointments.length,
        upcomingTodayCount: upcomingToday.length,
        upcomingTodayRevenue: upcomingToday.reduce((sum, apt) => sum + Number(apt.service_price), 0),
        nextAppointment: sortedUpcoming[0] || null,
        weeklyBookingsCount: weeklyAppointments.length,
        weeklyRevenue,
        weeklyRevenueChange,
        paymentStatusSummary,
        popularServices,
        dailyRevenue,
        todaySchedule,
    };
}
