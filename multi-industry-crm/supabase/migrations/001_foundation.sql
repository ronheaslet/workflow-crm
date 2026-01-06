-- ============================================================================
-- MULTI-INDUSTRY CRM - FOUNDATION SCHEMA
-- Tenant-first architecture with industry configuration
-- ============================================================================

-- ENUMS
CREATE TYPE industry_type AS ENUM (
  'blue_collar', 'medical', 'beauty_wellness', 'professional_services',
  'home_services', 'automotive', 'fitness', 'pet_services', 'events', 'custom'
);

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'member', 'field_worker', 'customer');
CREATE TYPE job_status AS ENUM ('lead', 'quoted', 'scheduled', 'in_progress', 'complete', 'invoiced', 'paid', 'cancelled');
CREATE TYPE voice_entry_status AS ENUM ('pending', 'processing', 'parsed', 'failed');
CREATE TYPE billing_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- TENANTS (Organizations)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  industry industry_type NOT NULL DEFAULT 'blue_collar',
  feature_config jsonb DEFAULT '{
    "inventory": false,
    "appointments": false,
    "compliance": false,
    "recurring_billing": false,
    "equipment_tracking": false,
    "voice_workflow": true
  }'::jsonb,
  industry_config jsonb DEFAULT '{}'::jsonb,
  branding jsonb DEFAULT '{}'::jsonb,
  subscription_tier text DEFAULT 'starter',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TENANT USERS
CREATE TABLE tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  hourly_rate decimal(10,2),
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- CONTACTS (Customers/Clients/Patients - terminology varies by industry)
CREATE TABLE contacts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  phone_secondary text,
  address text,
  city text,
  state text,
  zip text,
  contact_type text DEFAULT 'customer',
  source text,
  tags text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  notes text,
  total_jobs int DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- JOBS/PROJECTS (Core workflow entity)
CREATE TABLE jobs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id bigint REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id),

  -- Core fields
  title text NOT NULL,
  description text,
  status job_status DEFAULT 'lead',
  job_type text,

  -- Scheduling
  scheduled_date date,
  scheduled_time_start time,
  scheduled_time_end time,
  actual_start timestamptz,
  actual_end timestamptz,

  -- Location
  service_address text,
  service_city text,
  service_state text,
  service_zip text,

  -- Pricing
  estimated_hours decimal(4,2),
  estimated_total decimal(10,2),
  actual_hours decimal(4,2),
  actual_total decimal(10,2),
  hourly_rate decimal(10,2),

  -- Industry-specific
  custom_fields jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VOICE ENTRIES (Voice-to-text job updates)
CREATE TABLE voice_entries (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  job_id bigint REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),

  -- Audio
  audio_url text,
  duration_seconds int,

  -- Transcription
  raw_transcription text,
  status voice_entry_status DEFAULT 'pending',

  -- AI Parsed Results
  parsed_data jsonb DEFAULT '{}'::jsonb,
  billing_items_generated jsonb DEFAULT '[]'::jsonb,
  tasks_generated jsonb DEFAULT '[]'::jsonb,
  inventory_updates jsonb DEFAULT '[]'::jsonb,

  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- BILLING ITEMS
CREATE TABLE billing_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  job_id bigint REFERENCES jobs(id) ON DELETE CASCADE,
  voice_entry_id bigint REFERENCES voice_entries(id),

  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  item_type text DEFAULT 'labor',
  status billing_status DEFAULT 'draft',

  created_at timestamptz DEFAULT now()
);

-- ACTIVITIES (Communications log)
CREATE TABLE activities (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id bigint REFERENCES contacts(id) ON DELETE CASCADE,
  job_id bigint REFERENCES jobs(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id),

  activity_type text NOT NULL,
  title text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

-- INVENTORY (Blue collar module)
CREATE TABLE inventory_items (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,

  name text NOT NULL,
  sku text,
  description text,
  category text,

  quantity_on_hand int DEFAULT 0,
  quantity_reserved int DEFAULT 0,
  reorder_point int DEFAULT 5,
  unit_cost decimal(10,2),
  unit_price decimal(10,2),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- APPOINTMENTS (Service industry module)
CREATE TABLE appointments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id bigint REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id),

  service_type text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int DEFAULT 60,
  status text DEFAULT 'scheduled',
  notes text,

  created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX idx_jobs_status ON jobs(tenant_id, status);
CREATE INDEX idx_voice_entries_job ON voice_entries(job_id);
CREATE INDEX idx_billing_items_job ON billing_items(job_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_inventory_tenant ON inventory_items(tenant_id);
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id, scheduled_at);

-- RLS POLICIES
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Users see own tenants" ON tenants
  FOR SELECT USING (id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Users see own tenant memberships" ON tenant_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tenant data isolation" ON contacts
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON jobs
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON voice_entries
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON billing_items
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON activities
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON inventory_items
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant data isolation" ON appointments
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()));
