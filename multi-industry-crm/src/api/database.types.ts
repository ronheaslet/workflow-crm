export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type IndustryType =
  | 'blue_collar'
  | 'medical'
  | 'beauty_wellness'
  | 'professional_services'
  | 'home_services'
  | 'automotive'
  | 'fitness'
  | 'pet_services'
  | 'events'
  | 'mortgage'
  | 'insurance'
  | 'real_estate'
  | 'legal'
  | 'accounting'
  | 'custom';

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'field_worker' | 'customer';
export type JobStatus = 'lead' | 'quoted' | 'scheduled' | 'in_progress' | 'complete' | 'invoiced' | 'paid' | 'cancelled';
export type VoiceEntryStatus = 'pending' | 'processing' | 'parsed' | 'failed';
export type BillingStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: IndustryType;
          feature_config: Json;
          industry_config: Json;
          branding: Json;
          subscription_tier: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: IndustryType;
          feature_config?: Json;
          industry_config?: Json;
          branding?: Json;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          industry?: IndustryType;
          feature_config?: Json;
          industry_config?: Json;
          branding?: Json;
          subscription_tier?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: UserRole;
          hourly_rate: number | null;
          is_active: boolean;
          permissions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: UserRole;
          hourly_rate?: number | null;
          is_active?: boolean;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: UserRole;
          hourly_rate?: number | null;
          is_active?: boolean;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: number;
          tenant_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          phone_secondary: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          contact_type: string;
          source: string | null;
          tags: string[] | null;
          custom_fields: Json;
          notes: string | null;
          total_jobs: number;
          total_revenue: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          phone_secondary?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          contact_type?: string;
          source?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          notes?: string | null;
          total_jobs?: number;
          total_revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          phone_secondary?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          contact_type?: string;
          source?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          notes?: string | null;
          total_jobs?: number;
          total_revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: number;
          tenant_id: string;
          contact_id: number | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          status: JobStatus;
          job_type: string | null;
          scheduled_date: string | null;
          scheduled_time_start: string | null;
          scheduled_time_end: string | null;
          actual_start: string | null;
          actual_end: string | null;
          service_address: string | null;
          service_city: string | null;
          service_state: string | null;
          service_zip: string | null;
          estimated_hours: number | null;
          estimated_total: number | null;
          actual_hours: number | null;
          actual_total: number | null;
          hourly_rate: number | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          contact_id?: number | null;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          status?: JobStatus;
          job_type?: string | null;
          scheduled_date?: string | null;
          scheduled_time_start?: string | null;
          scheduled_time_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          service_address?: string | null;
          service_city?: string | null;
          service_state?: string | null;
          service_zip?: string | null;
          estimated_hours?: number | null;
          estimated_total?: number | null;
          actual_hours?: number | null;
          actual_total?: number | null;
          hourly_rate?: number | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          contact_id?: number | null;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          status?: JobStatus;
          job_type?: string | null;
          scheduled_date?: string | null;
          scheduled_time_start?: string | null;
          scheduled_time_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          service_address?: string | null;
          service_city?: string | null;
          service_state?: string | null;
          service_zip?: string | null;
          estimated_hours?: number | null;
          estimated_total?: number | null;
          actual_hours?: number | null;
          actual_total?: number | null;
          hourly_rate?: number | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_entries: {
        Row: {
          id: number;
          tenant_id: string;
          job_id: number;
          user_id: string | null;
          audio_url: string | null;
          duration_seconds: number | null;
          raw_transcription: string | null;
          status: VoiceEntryStatus;
          parsed_data: Json;
          billing_items_generated: Json;
          tasks_generated: Json;
          inventory_updates: Json;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          job_id: number;
          user_id?: string | null;
          audio_url?: string | null;
          duration_seconds?: number | null;
          raw_transcription?: string | null;
          status?: VoiceEntryStatus;
          parsed_data?: Json;
          billing_items_generated?: Json;
          tasks_generated?: Json;
          inventory_updates?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          job_id?: number;
          user_id?: string | null;
          audio_url?: string | null;
          duration_seconds?: number | null;
          raw_transcription?: string | null;
          status?: VoiceEntryStatus;
          parsed_data?: Json;
          billing_items_generated?: Json;
          tasks_generated?: Json;
          inventory_updates?: Json;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      billing_items: {
        Row: {
          id: number;
          tenant_id: string;
          job_id: number;
          voice_entry_id: number | null;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          item_type: string;
          status: BillingStatus;
          created_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          job_id: number;
          voice_entry_id?: number | null;
          description: string;
          quantity?: number;
          unit_price: number;
          total: number;
          item_type?: string;
          status?: BillingStatus;
          created_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          job_id?: number;
          voice_entry_id?: number | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          item_type?: string;
          status?: BillingStatus;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: number;
          tenant_id: string;
          contact_id: number;
          job_id: number | null;
          user_id: string | null;
          activity_type: string;
          title: string | null;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          contact_id: number;
          job_id?: number | null;
          user_id?: string | null;
          activity_type: string;
          title?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          contact_id?: number;
          job_id?: number | null;
          user_id?: string | null;
          activity_type?: string;
          title?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: number;
          tenant_id: string;
          name: string;
          sku: string | null;
          description: string | null;
          category: string | null;
          quantity_on_hand: number;
          quantity_reserved: number;
          reorder_point: number;
          unit_cost: number | null;
          unit_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          name: string;
          sku?: string | null;
          description?: string | null;
          category?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          reorder_point?: number;
          unit_cost?: number | null;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          name?: string;
          sku?: string | null;
          description?: string | null;
          category?: string | null;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          reorder_point?: number;
          unit_cost?: number | null;
          unit_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: number;
          tenant_id: string;
          contact_id: number;
          assigned_to: string | null;
          service_type: string | null;
          scheduled_at: string;
          duration_minutes: number;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          tenant_id: string;
          contact_id: number;
          assigned_to?: string | null;
          service_type?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          tenant_id?: string;
          contact_id?: number;
          assigned_to?: string | null;
          service_type?: string | null;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      industry_type: IndustryType;
      user_role: UserRole;
      job_status: JobStatus;
      voice_entry_status: VoiceEntryStatus;
      billing_status: BillingStatus;
    };
  };
}

// Convenience types
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
export type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export type TenantUser = Database['public']['Tables']['tenant_users']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type VoiceEntry = Database['public']['Tables']['voice_entries']['Row'];
export type BillingItem = Database['public']['Tables']['billing_items']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
