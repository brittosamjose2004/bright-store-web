'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface Profile {
    id: string;
    full_name: string | null;
    phone: string | null;
    alt_phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    landmark: string | null;
    city: string | null;
    pincode: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfile = async (userId: string) => {
        // ... (existing fetchProfile logic)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('No profile found for user, likely a new user.');
                    setProfile(null);
                } else {
                    console.error('Error fetching profile:', error.message || error);
                }
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    useEffect(() => {
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        };

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        setData();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // Auto-redirect to profile if incomplete
    useEffect(() => {
        if (!loading && user) {
            // Check if profile is missing or incomplete (phone is a good mandatory field)
            const isIncomplete = !profile || !profile.phone || !profile.address_line1;

            // Avoid redirecting if already on profile page to prevent loop
            if (isIncomplete && pathname !== '/profile') {
                console.log('Profile incomplete, redirecting to /profile');
                router.push('/profile');
            }
        }
    }, [user, profile, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
