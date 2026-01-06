import { useEffect, useState } from 'react';
import { Card } from '../components/core/Card';
import { useTenant } from '../contexts/TenantContext';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { supabase } from '../api/supabase';
import { Users, Briefcase, DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react';
import type { Job } from '../api/database.types';

interface Stats {
  totalContacts: number;
  totalJobs: number;
  activeJobs: number;
  revenue: number;
}

interface JobStats {
  status: Job['status'];
  actual_total: number | null;
}

export function Dashboard() {
  const { tenant } = useTenant();
  const { t, hasFeature } = useIndustryConfig();
  const [stats, setStats] = useState<Stats>({
    totalContacts: 0,
    totalJobs: 0,
    activeJobs: 0,
    revenue: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      loadDashboardData();
    }
  }, [tenant]);

  const loadDashboardData = async () => {
    setLoading(true);

    // Get contacts count
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Get jobs stats
    const { data: jobs } = await supabase
      .from('jobs')
      .select('status, actual_total');

    const activeStatuses = ['scheduled', 'in_progress', 'quoted'];
    const jobsList = (jobs || []) as JobStats[];
    const activeJobs = jobsList.filter((j) => activeStatuses.includes(j.status)).length;
    const revenue = jobsList.reduce((sum, j) => sum + (j.actual_total || 0), 0);

    // Get recent jobs
    const { data: recent } = await supabase
      .from('jobs')
      .select('*, contacts(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      totalContacts: contactsCount || 0,
      totalJobs: jobs?.length || 0,
      activeJobs,
      revenue,
    });
    setRecentJobs(recent || []);
    setLoading(false);
  };

  const statCards = [
    {
      label: t('contacts'),
      value: stats.totalContacts,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: `Total ${t('jobs')}`,
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      label: `Active ${t('jobs')}`,
      value: stats.activeJobs,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to {tenant?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card title={`Recent ${t('jobs')}`}>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No {t('jobs').toLowerCase()} yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate">{job.title}</p>
                    <p className="text-sm text-gray-500">
                      {job.contacts?.full_name || 'No contact'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full capitalize ${
                      job.status === 'complete'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/contacts"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users size={20} className="text-primary" />
              <span className="font-medium text-slate">Add {t('contact')}</span>
            </a>
            <a
              href="/jobs"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Briefcase size={20} className="text-primary" />
              <span className="font-medium text-slate">New {t('job')}</span>
            </a>
            {hasFeature('voice_workflow') && (
              <a
                href="/voice"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <TrendingUp size={20} className="text-primary" />
                <span className="font-medium text-slate">Voice Entry</span>
              </a>
            )}
            {hasFeature('appointments') && (
              <a
                href="/appointments"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Calendar size={20} className="text-primary" />
                <span className="font-medium text-slate">Schedule</span>
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
