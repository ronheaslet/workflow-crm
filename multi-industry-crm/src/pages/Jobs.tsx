import { useEffect, useState } from 'react';
import { Button } from '../components/core/Button';
import { Input } from '../components/core/Input';
import { Modal } from '../components/core/Modal';
import { Badge } from '../components/core/Badge';
import { useTenant } from '../contexts/TenantContext';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { supabase } from '../api/supabase';
import { Plus, Calendar, User, DollarSign } from 'lucide-react';
import type { Job, Contact } from '../api/database.types';

type JobWithContact = Job & { contacts: { full_name: string } | null };

export function Jobs() {
  const { tenant } = useTenant();
  const { t, getPipelineStages, getJobTypes } = useIndustryConfig();
  const [jobs, setJobs] = useState<JobWithContact[]>([]);
  const [contacts, setContacts] = useState<Pick<Contact, 'id' | 'full_name'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contact_id: '',
    job_type: '',
    status: 'lead' as Job['status'],
    scheduled_date: '',
    estimated_total: '',
    description: ''
  });

  const stages = getPipelineStages();
  const jobTypes = getJobTypes();

  useEffect(() => {
    if (tenant) {
      loadJobs();
      loadContacts();
    }
  }, [tenant]);

  const loadJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('*, contacts(full_name)')
      .order('created_at', { ascending: false });
    setJobs((data || []) as JobWithContact[]);
    setLoading(false);
  };

  const loadContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('id, full_name')
      .order('full_name');
    setContacts((data || []) as Pick<Contact, 'id' | 'full_name'>[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('jobs').insert({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      job_type: formData.job_type,
      scheduled_date: formData.scheduled_date || null,
      tenant_id: tenant?.id,
      contact_id: formData.contact_id ? parseInt(formData.contact_id) : null,
      estimated_total: formData.estimated_total ? parseFloat(formData.estimated_total) : null
    });
    setIsModalOpen(false);
    resetForm();
    loadJobs();
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    loadJobs();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      contact_id: '',
      job_type: jobTypes[0] || '',
      status: 'lead',
      scheduled_date: '',
      estimated_total: '',
      description: ''
    });
  };

  const getJobsByStatus = (status: string) => jobs.filter(j => j.status === status);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100',
      quoted: 'bg-yellow-50',
      scheduled: 'bg-blue-50',
      in_progress: 'bg-purple-50',
      complete: 'bg-green-50',
      invoiced: 'bg-orange-50',
      paid: 'bg-green-100',
      funded: 'bg-green-100',
      closed: 'bg-green-100'
    };
    return colors[status] || 'bg-gray-50';
  };

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
        <h1 className="text-3xl font-bold text-slate">{t('jobs')}</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> New {t('job')}
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="bg-gray-100 rounded-t-lg px-4 py-2 font-semibold text-slate capitalize flex items-center justify-between">
              <span>{stage.replace('_', ' ')}</span>
              <Badge>{getJobsByStatus(stage).length}</Badge>
            </div>
            <div className={`${getStatusColor(stage)} rounded-b-lg p-2 min-h-[400px] space-y-2`}>
              {getJobsByStatus(stage).map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-slate mb-2">{job.title}</h4>
                  <div className="space-y-1 text-sm text-gray-500">
                    {job.contacts?.full_name && (
                      <div className="flex items-center gap-1">
                        <User size={14} /> {job.contacts.full_name}
                      </div>
                    )}
                    {job.scheduled_date && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(job.scheduled_date).toLocaleDateString()}
                      </div>
                    )}
                    {job.estimated_total && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} /> ${job.estimated_total.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {stages.filter(s => s !== stage).slice(0, 3).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(job.id, s)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded capitalize"
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`New ${t('job')}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-1">{t('contact')}</label>
              <select
                value={formData.contact_id}
                onChange={e => setFormData({ ...formData, contact_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select {t('contact').toLowerCase()}...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-1">Type</label>
              <select
                value={formData.job_type}
                onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduled_date}
              onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
            <Input
              label="Estimated Total"
              type="number"
              value={formData.estimated_total}
              onChange={e => setFormData({ ...formData, estimated_total: e.target.value })}
              placeholder="$0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create {t('job')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
