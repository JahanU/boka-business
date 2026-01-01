-- Staff Availability System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name TEXT NOT NULL,
	email TEXT,
	phone TEXT,
	address TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	email TEXT NOT NULL,
	name TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'staff',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE(user_id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
	staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
	customer_name TEXT,
	customer_email TEXT,
	customer_phone TEXT,
	service_name TEXT,
	appointment_date DATE NOT NULL,
	appointment_time TIME NOT NULL,
	duration_minutes INTEGER DEFAULT 30,
	status TEXT DEFAULT 'pending',
	notes TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_availability table
CREATE TABLE IF NOT EXISTS staff_availability (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
	availability_type TEXT NOT NULL CHECK (availability_type IN ('working_hours', 'annual_leave')),
	day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
	specific_date DATE,
	end_date DATE,
	start_time TIME,
	end_time TIME,
	is_recurring BOOLEAN DEFAULT false,
	notes TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	CHECK (
		(availability_type = 'working_hours' AND is_recurring = true AND day_of_week IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL) OR
		(availability_type = 'annual_leave' AND is_recurring = false AND specific_date IS NOT NULL)
	)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_id ON staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_type ON staff_availability(availability_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Staff can view their own business" ON businesses
	FOR SELECT USING (
		id = get_my_business_id()
	);

-- RLS Policies for staff
-- To avoid infinite recursion, we use a security definer function to check business_id
CREATE OR REPLACE FUNCTION get_my_business_id()
RETURNS UUID AS $$
	SELECT business_id FROM public.staff WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Staff can view staff in their business" ON staff
	FOR SELECT USING (
		business_id = get_my_business_id()
	);

CREATE POLICY "Staff can update their own profile" ON staff
	FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments in their business" ON appointments
	FOR SELECT USING (
		business_id = get_my_business_id()
	);

CREATE POLICY "Staff can manage appointments in their business" ON appointments
	FOR ALL USING (
		business_id = get_my_business_id()
	);

-- RLS Policies for staff_availability
CREATE POLICY "Staff can view their own availability" ON staff_availability
	FOR SELECT USING (
		staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
	);

CREATE POLICY "Staff can manage their own availability" ON staff_availability
	FOR ALL USING (
		staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
	);
