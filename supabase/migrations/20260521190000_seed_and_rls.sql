DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  -- 1. Ensure RLS is enabled
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.lcdpr_files ENABLE ROW LEVEL SECURITY;

  -- 2. Create Company "Empresa Administrativa"
  v_company_id := gen_random_uuid();
  INSERT INTO public.companies (id, name, tax_id)
  VALUES (v_company_id, 'Empresa Administrativa', '00000000000100')
  ON CONFLICT (tax_id) DO NOTHING;

  -- Ensure we have the exact company ID
  SELECT id INTO v_company_id FROM public.companies WHERE tax_id = '00000000000100' LIMIT 1;

  -- 3. Create User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'leandro_teza@hotmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'leandro_teza@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'leandro_teza@hotmail.com' LIMIT 1;
    -- Make sure tokens are fixed in case they had nulls
    UPDATE auth.users
    SET
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = v_user_id AND (
      confirmation_token IS NULL OR recovery_token IS NULL
      OR email_change_token_new IS NULL OR email_change IS NULL
      OR email_change_token_current IS NULL
      OR phone_change IS NULL OR phone_change_token IS NULL
      OR reauthentication_token IS NULL
    );
  END IF;

  -- 4. Create/Update Profile
  INSERT INTO public.profiles (id, company_id, full_name, role)
  VALUES (v_user_id, v_company_id, 'Leandro Teza', 'admin')
  ON CONFLICT (id) DO UPDATE SET 
    company_id = EXCLUDED.company_id,
    role = 'admin';

END $$;

-- 5. Create or Replace RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can access their company" ON public.companies;
CREATE POLICY "Users can access their company" ON public.companies
  FOR ALL TO authenticated 
  USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can access their producers" ON public.producers;
CREATE POLICY "Users can access their producers" ON public.producers
  FOR ALL TO authenticated 
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can access their files" ON public.lcdpr_files;
CREATE POLICY "Users can access their files" ON public.lcdpr_files
  FOR ALL TO authenticated 
  USING (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
  WITH CHECK (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));
