import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '@/config/supabaseClient';
import { staffService } from '@boka/shared/services/staffService';
import type { Staff, Business } from '@boka/shared/types';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	staff: Staff | null;
	business: Business | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
	resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
	updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [staff, setStaff] = useState<Staff | null>(null);
	const [business, setBusiness] = useState<Business | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchStaffAndBusiness = async (userId: string) => {
		const staffData = await staffService.getByUserId(userId);
		if (staffData) {
			setStaff(staffData);
			if (staffData.businesses) {
				setBusiness(staffData.businesses);
			}
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchStaffAndBusiness(session.user.id);
			}
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchStaffAndBusiness(session.user.id);
			} else {
				setStaff(null);
				setBusiness(null);
			}
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		});
		if (data?.user) {
			fetchStaffAndBusiness(data.user.id);
		}
		return { error };
	};

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	const resetPassword = async (email: string) => {
		const redirectTo = Linking.createURL('reset-password');
		const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
			redirectTo,
		});
		return { error };
	};

	const updatePassword = async (password: string) => {
		const { error } = await supabase.auth.updateUser({ password });
		return { error };
	};

	const value: AuthContextType = {
		user,
		session,
		staff,
		business,
		loading,
		signIn,
		resetPassword,
		updatePassword,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
