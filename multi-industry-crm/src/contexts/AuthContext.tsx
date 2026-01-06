import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Auto-create tenant for new signups
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserHasTenant(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserHasTenant = async (user: User) => {
    // Check if user already has a tenant
    const { data: existingMembership } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (existingMembership) {
      return; // User already has a tenant
    }

    // Create a new tenant for the user
    const emailPrefix = user.email?.split('@')[0] || 'user';
    const slug = `${emailPrefix}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: `${emailPrefix}'s Business`,
        slug: slug,
        industry: 'blue_collar',
        subscription_tier: 'starter'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Failed to create tenant:', tenantError);
      return;
    }

    // Link user to tenant as owner
    const { error: linkError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: newTenant.id,
        user_id: user.id,
        role: 'owner'
      });

    if (linkError) {
      console.error('Failed to link user to tenant:', linkError);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    // If signup successful and user confirmed (no email confirmation required)
    if (!error && data.user && data.session) {
      await ensureUserHasTenant(data.user);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
