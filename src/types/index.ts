// Database Types
export interface Business {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface Staff {
    id: string;
    business_id: string;
    user_id: string;
    email: string;
    name: string;
    role: 'owner' | 'staff' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface Appointment {
    id: string;
    business_id: string;
    staff_id: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    service_name?: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export type AvailabilityType = 'working_hours' | 'annual_leave';

export interface StaffAvailability {
    id: string;
    staff_id: string;
    availability_type: AvailabilityType;
    day_of_week?: number; // 0-6 for Monday-Sunday
    specific_date?: string; // ISO date string (Start date)
    end_date?: string; // ISO date string (End date)
    start_time?: string; // HH:MM format
    end_time?: string; // HH:MM format
    is_recurring: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Form Types
export interface AvailabilityFormData {
    availability_type: AvailabilityType;
    day_of_week?: number;
    specific_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    is_recurring: boolean;
    notes?: string;
}

export interface WeeklySchedule {
    [key: number]: {
        // key is day_of_week (0-6 for Monday-Sunday)
        enabled: boolean;
        start_time: string;
        end_time: string;
    };
}

// Helper type for day names
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type DayName = (typeof DAY_NAMES)[number];
