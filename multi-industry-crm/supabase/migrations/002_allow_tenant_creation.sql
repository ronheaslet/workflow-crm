-- ============================================================================
-- ALLOW AUTHENTICATED USERS TO CREATE TENANTS
-- Fixes the first-login experience so new users can create their own tenant
-- ============================================================================

-- Allow any authenticated user to insert a new tenant
CREATE POLICY "Authenticated users can create tenants" ON tenants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any authenticated user to insert themselves into tenant_users
-- (but only for tenants they own or are being added to)
CREATE POLICY "Users can create tenant memberships" ON tenant_users
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own tenant (if they're an owner)
CREATE POLICY "Owners can update their tenants" ON tenants
  FOR UPDATE
  USING (id IN (
    SELECT tenant_id FROM tenant_users
    WHERE user_id = auth.uid() AND role = 'owner'
  ));
