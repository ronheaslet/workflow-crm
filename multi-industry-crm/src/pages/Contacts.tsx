import { useEffect, useState } from 'react';
import { Card } from '../components/core/Card';
import { Button } from '../components/core/Button';
import { Input } from '../components/core/Input';
import { Modal } from '../components/core/Modal';
import { Badge } from '../components/core/Badge';
import { useTenant } from '../contexts/TenantContext';
import { useIndustryConfig } from '../hooks/useIndustryConfig';
import { supabase } from '../api/supabase';
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import type { Contact } from '../api/database.types';

export function Contacts() {
  const { tenant } = useTenant();
  const { t } = useIndustryConfig();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_type: 'customer',
    source: '',
    notes: ''
  });

  useEffect(() => {
    if (tenant) loadContacts();
  }, [tenant, search]);

  const loadContacts = async () => {
    setLoading(true);
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data } = await query.limit(100);
    setContacts((data || []) as Contact[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingContact) {
      await supabase
        .from('contacts')
        .update(formData)
        .eq('id', editingContact.id);
    } else {
      await supabase
        .from('contacts')
        .insert({ ...formData, tenant_id: tenant?.id });
    }

    setIsModalOpen(false);
    setEditingContact(null);
    resetForm();
    loadContacts();
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      full_name: contact.full_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || '',
      contact_type: contact.contact_type || 'customer',
      source: contact.source || '',
      notes: contact.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this contact?')) {
      await supabase.from('contacts').delete().eq('id', id);
      loadContacts();
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      contact_type: 'customer',
      source: '',
      notes: ''
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate">{t('contacts')}</h1>
        <Button onClick={() => { resetForm(); setEditingContact(null); setIsModalOpen(true); }}>
          <Plus size={20} /> Add {t('contact')}
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${t('contacts').toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {t('contacts').toLowerCase()} found
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate">{contact.full_name}</h3>
                    <Badge variant="info">{contact.contact_type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {contact.phone}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {contact.email}
                      </span>
                    )}
                    {contact.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {contact.city}, {contact.state}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        title={editingContact ? `Edit ${t('contact')}` : `New ${t('contact')}`}
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
            <Input
              label="Source"
              value={formData.source}
              onChange={e => setFormData({ ...formData, source: e.target.value })}
              placeholder="Referral, Website, etc."
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="ZIP"
              value={formData.zip}
              onChange={e => setFormData({ ...formData, zip: e.target.value })}
            />
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
            <Button type="submit">
              {editingContact ? 'Save Changes' : `Create ${t('contact')}`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
