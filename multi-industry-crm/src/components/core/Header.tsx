import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Button } from './Button';
import { Bell, LogOut, User } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();
  const { tenant } = useTenant();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        {tenant && (
          <span className="text-sm text-gray-500">
            {tenant.subscription_tier?.charAt(0).toUpperCase() + tenant.subscription_tier?.slice(1)} Plan
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate">{user?.email?.split('@')[0]}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
