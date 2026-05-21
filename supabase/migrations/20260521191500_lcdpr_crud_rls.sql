DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  -- 1. Create Company
  v_company_id := gen_random_uuid();
  INSERT INTO public.companies (id, name, tax_id)
  VALUES (v_company_id, 'Empresa Administrativa', '00000000000100')
  ON CONFLICT (tax_id) DO NOTHING;

  SELECT id INTO v_company_id FROM public.companies WHERE tax_id = '00000000000100' LIMIT 1;

  -- 2. Create User
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
    WHERE id = v_user_id;
  END IF;

  -- 3. Profile
  INSERT INTO public.profiles (id, company_id, full_name, role)
  VALUES (v_user_id, v_company_id, 'Leandro Teza', 'admin')
  ON CONFLICT (id) DO UPDATE SET 
    company_id = EXCLUDED.company_id,
    role = 'admin';

  -- 4. RLS Updates
  DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
  CREATE POLICY "Users can insert own company" ON public.companies
    FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
  CREATE POLICY "Users can update own company" ON public.companies
    FOR UPDATE TO authenticated 
    USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

  DROP POLICY IF EXISTS "Users can delete own company" ON public.companies;
  CREATE POLICY "Users can delete own company" ON public.companies
    FOR DELETE TO authenticated 
    USING (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

  DROP POLICY IF EXISTS "Users can insert own producers" ON public.producers;
  CREATE POLICY "Users can insert own producers" ON public.producers
    FOR INSERT TO authenticated 
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

  DROP POLICY IF EXISTS "Users can update own producers" ON public.producers;
  CREATE POLICY "Users can update own producers" ON public.producers
    FOR UPDATE TO authenticated 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

  DROP POLICY IF EXISTS "Users can delete own producers" ON public.producers;
  CREATE POLICY "Users can delete own producers" ON public.producers
    FOR DELETE TO authenticated 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

  DROP POLICY IF EXISTS "Users can insert own files" ON public.lcdpr_files;
  CREATE POLICY "Users can insert own files" ON public.lcdpr_files
    FOR INSERT TO authenticated 
    WITH CHECK (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

  DROP POLICY IF EXISTS "Users can update own files" ON public.lcdpr_files;
  CREATE POLICY "Users can update own files" ON public.lcdpr_files
    FOR UPDATE TO authenticated 
    USING (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())))
    WITH CHECK (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

  DROP POLICY IF EXISTS "Users can delete own files" ON public.lcdpr_files;
  CREATE POLICY "Users can delete own files" ON public.lcdpr_files
    FOR DELETE TO authenticated 
    USING (producer_id IN (SELECT id FROM public.producers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

END $$;
