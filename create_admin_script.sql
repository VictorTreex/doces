-- ========================================
-- CRIAÇÃO AUTOMÁTICA DO ADMIN
-- Execute APÓS criar a conta na aplicação
-- ========================================

DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Encontre o user_id pelo email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'admindoces@admin.com' 
  LIMIT 1;
  
  -- Se encontrou, crie o role admin
  IF user_uuid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (user_uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin criado para o usuário: %', user_uuid;
  ELSE
    RAISE NOTICE 'Usuário não encontrado. Crie a conta primeiro.';
  END IF;
END $$;

-- Verificar se admin foi criado
SELECT ur.*, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE ur.role = 'admin';
