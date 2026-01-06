import { NavLink } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useIndustryConfig } from '../../hooks/useIndustryConfig';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Handshake,
  Mic,
  Package,
  Calendar,
  Shield,
  Settings,
  ChevronDown,
} from 'lucide-react';

export function Sidebar() {
  const { tenant, tenants, switchTenant } = useTenant();
  const { t, hasFeature } = useIndustryConfig();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', always: true },
    { to: '/contacts', icon: Users, label: t('contacts'), always: true },
    { to: '/jobs', icon: Briefcase, label: t('jobs'), always: true },
    { to: '/partners', icon: Handshake, label: 'Partners', always: true },
    { to: '/voice', icon: Mic, label: 'Voice Entry', feature: 'voice_workflow' as const },
    { to: '/inventory', icon: Package, label: 'Inventory', feature: 'inventory' as const },
    { to: '/appointments', icon: Calendar, label: 'Appointments', feature: 'appointments' as const },
    { to: '/compliance', icon: Shield, label: 'Compliance', feature: 'compliance' as const },
    { to: '/settings', icon: Settings, label: 'Settings', always: true },
  ];

  const visibleItems = navItems.filter(
    item => item.always || (item.feature && hasFeature(item.feature))
  );

  return (
    <aside className="w-64 bg-slate text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">WorkflowCRM</h1>
      </div>

      {/* Tenant Switcher */}
      {tenants.length > 1 && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="relative">
            <select
              value={tenant?.id || ''}
              onChange={(e) => switchTenant(e.target.value)}
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="text-slate">
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Current Tenant */}
      {tenant && tenants.length <= 1 && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm text-white/60">Organization</p>
          <p className="font-medium">{tenant.name}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Industry Badge */}
      {tenant && (
        <div className="p-4 border-t border-white/10">
          <span className="text-xs text-white/50 uppercase tracking-wider">
            {tenant.industry?.replace('_', ' ')}
          </span>
        </div>
      )}
    </aside>
  );
}
