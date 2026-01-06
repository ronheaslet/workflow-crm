import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from './AuthContext';
import type { Tenant, TenantUser } from '../api/database.types';

interface TenantContextType {
  tenant: Tenant | null;
  tenantUser: TenantUser | null;
  tenants: Tenant[];
  loading: boolean;
  switchTenant: (tenantId: string) => void;
  refetchTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTenants = async () => {
    if (!user) {
      setTenant(null);
      setTenantUser(null);
      setTenants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get all tenant memberships for the user
    const { data: memberships } = await supabase
      .from('tenant_users')
      .select('*, tenants(*)')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (memberships && memberships.length > 0) {
      type MembershipWithTenant = TenantUser & { tenants: Tenant | null };
      const typedMemberships = memberships as unknown as MembershipWithTenant[];

      const userTenants = typedMemberships
        .map(m => m.tenants)
        .filter((t): t is Tenant => t !== null);

      setTenants(userTenants);

      // Use saved tenant ID or default to first
      const savedTenantId = localStorage.getItem('currentTenantId');
      const currentTenant = userTenants.find(t => t.id === savedTenantId) || userTenants[0];

      setTenant(currentTenant);
      const currentMembership = typedMemberships.find(m => m.tenants?.id === currentTenant.id);
      setTenantUser(currentMembership || null);
    } else {
      setTenants([]);
      setTenant(null);
      setTenantUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTenants();
  }, [user]);

  const switchTenant = (tenantId: string) => {
    const newTenant = tenants.find(t => t.id === tenantId);
    if (newTenant) {
      setTenant(newTenant);
      localStorage.setItem('currentTenantId', tenantId);
    }
  };

  const refetchTenant = async () => {
    await loadTenants();
  };

  return (
    <TenantContext.Provider value={{ tenant, tenantUser, tenants, loading, switchTenant, refetchTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
