import { useEffect, useState } from 'react';
import { Card } from '../components/core/Card';
import { Button } from '../components/core/Button';
import { Input } from '../components/core/Input';
import { Modal } from '../components/core/Modal';
import { Badge } from '../components/core/Badge';
import { useTenant } from '../contexts/TenantContext';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { supabase } from '../api/supabase';
import { Plus, Search, Phone, Mail, Building, Star } from 'lucide-react';
import type { Contact } from '../api/database.types';

interface PartnerCustomFields {
  partner_type?: string;
  partner_tier?: string;
  company?: string;
}

type Partner = Contact & { custom_fields: PartnerCustomFields };

export function Partners() {
  const { tenant } = useTenant();
  const { getPartnerTypes, getPartnerTiers } = useIndustryConfig();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    partner_type: '',
    partner_tier: 'prospect',
    notes: ''
  });

  const partnerTypes = getPartnerTypes();
  const partnerTiers = getPartnerTiers();

  useEffect(() => {
    if (tenant) loadPartners();
  }, [tenant, search]);

  const loadPartners = async () => {
    setLoading(true);
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('contact_type', 'partner')
      .order('full_name');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data } = await query.limit(100);
    setPartners((data || []) as Partner[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('contacts').insert({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      tenant_id: tenant?.id,
      contact_type: 'partner',
      custom_fields: {
        partner_type: formData.partner_type,
        partner_tier: formData.partner_tier,
        company: formData.company
      }
    });
    setIsModalOpen(false);
    resetForm();
    loadPartners();
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      partner_type: partnerTypes[0] || '',
      partner_tier: 'prospect',
      notes: ''
    });
  };

  const getTierBadgeVariant = (tier: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      prospect: 'default',
      top50: 'info',
      account: 'warning',
      channel: 'success',
      preferred: 'info',
      exclusive: 'success',
      referral: 'info',
      strategic: 'success',
      active: 'info'
    };
    return variants[tier] || 'default';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate">Partners</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> Add Partner
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No partners found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map(partner => (
              <div key={partner.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate">{partner.full_name}</h3>
                  <Badge variant={getTierBadgeVariant(partner.custom_fields?.partner_tier || 'prospect')}>
                    {partner.custom_fields?.partner_tier || 'prospect'}
                  </Badge>
                </div>

                {partner.custom_fields?.company && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Building size={14} /> {partner.custom_fields.company}
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <Star size={14} /> {partner.custom_fields?.partner_type || 'General'}
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  {partner.phone && (
                    <a href={`tel:${partner.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Phone size={14} /> Call
                    </a>
                  )}
                  {partner.email && (
                    <a href={`mailto:${partner.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail size={14} /> Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Partner"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-1">Partner Type</label>
              <select
                value={formData.partner_type}
                onChange={e => setFormData({ ...formData, partner_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {partnerTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-1">Tier</label>
              <select
                value={formData.partner_tier}
                onChange={e => setFormData({ ...formData, partner_tier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {partnerTiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Partner</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
