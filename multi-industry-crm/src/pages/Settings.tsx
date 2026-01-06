import { useState } from 'react';
import { Card } from '../components/core/Card';
import { Button } from '../components/core/Button';
import { Input } from '../components/core/Input';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';
import { Save, Building, Palette, Bell, Shield, Users } from 'lucide-react';

export function Settings() {
  const { tenant, refetchTenant } = useTenant();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [saving, setSaving] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    name: tenant?.name || '',
    slug: tenant?.slug || ''
  });

  const handleSaveBusiness = async () => {
    if (!tenant) return;
    setSaving(true);
    await supabase
      .from('tenants')
      .update({ name: businessForm.name })
      .eq('id', tenant.id);
    await refetchTenant();
    setSaving(false);
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate mb-8">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-slate'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'business' && (
            <Card title="Business Information">
              <div className="space-y-4 max-w-lg">
                <Input
                  label="Business Name"
                  value={businessForm.name}
                  onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })}
                />
                <Input
                  label="URL Slug"
                  value={businessForm.slug}
                  disabled
                  hint="Contact support to change your URL"
                />
                <Input
                  label="Industry"
                  value={tenant?.industry?.replace('_', ' ') || ''}
                  disabled
                  hint="Contact support to change your industry"
                />
                <Button onClick={handleSaveBusiness} loading={saving}>
                  <Save size={16} className="mr-2" /> Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card title="Team Members">
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-slate mb-2">Team Management</h3>
                <p className="text-gray-500 mb-4">Invite team members and manage permissions.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card title="Branding">
              <div className="text-center py-12">
                <Palette size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-slate mb-2">Custom Branding</h3>
                <p className="text-gray-500 mb-4">Customize your logo, colors, and more.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-slate mb-2">Notifications</h3>
                <p className="text-gray-500 mb-4">Configure email and push notifications.</p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security Settings">
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate mb-1">Email</label>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1">User ID</label>
                  <p className="text-gray-600 text-sm font-mono">{user?.id}</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
