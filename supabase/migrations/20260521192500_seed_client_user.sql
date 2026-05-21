DO $$
DECLARE
  v_company_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_user_id uuid;
BEGIN
  -- 1. Ensure test company exists
  INSERT INTO public.companies (id, name, tax_id)
  VALUES (v_company_id, 'Empresa de Teste Cliente', '00000000000001')
  ON CONFLICT (tax_id) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_company_id;
  
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE tax_id = '00000000000001' LIMIT 1;
  END IF;

  -- 2. Seed test user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'cliente@teste.com') THEN
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
      'cliente@teste.com',
      crypt('Cliente@Skip123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Cliente de Teste"}',
      false, 'authenticated', 'authenticated',
      '',    -- confirmation_token: MUST be '' not NULL
      '',    -- recovery_token: MUST be '' not NULL
      '',    -- email_change_token_new: MUST be '' not NULL
      '',    -- email_change: MUST be '' not NULL
      '',    -- email_change_token_current: MUST be '' not NULL
      NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
      '',    -- phone_change: MUST be '' not NULL
      '',    -- phone_change_token: MUST be '' not NULL
      ''     -- reauthentication_token: MUST be '' not NULL
    );

    -- 3. Create or update profile
    INSERT INTO public.profiles (id, full_name, role, company_id)
    VALUES (v_user_id, 'Cliente de Teste', 'viewer', v_company_id)
    ON CONFLICT (id) DO UPDATE 
    SET company_id = EXCLUDED.company_id, 
        role = EXCLUDED.role, 
        full_name = EXCLUDED.full_name;
  END IF;
END $$;
