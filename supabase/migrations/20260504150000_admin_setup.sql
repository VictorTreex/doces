-- Script para configurar o primeiro administrador
-- Email: admindoces@admin.com

-- 1. Encontre seu user_id:
-- SELECT id, email FROM auth.users WHERE email = 'admindoces@admin.com';

-- 2. Depois de encontrar o user_id, execute:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('SEU_USER_ID_AQUI', 'admin');

-- Exemplo completo (substitua o user_id encontrado):
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('12345678-1234-1234-1234-123456789012', 'admin');

-- Verificar se o admin foi criado:
-- SELECT ur.*, u.email 
-- FROM public.user_roles ur 
-- JOIN auth.users u ON ur.user_id = u.id 
-- WHERE ur.role = 'admin';
