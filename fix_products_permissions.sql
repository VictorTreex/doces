-- ========================================
-- CORRIGIR PERMISSÕES DA TABELA PRODUCTS
-- Execute este SQL para corrigir erro 403 ao criar produto
-- ========================================

-- 1. Verificar se tabela products existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'products';

-- 2. Verificar se usuário tem role admin
SELECT ur.*, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE u.email = 'admindoces@admin.com';

-- 3. Verificar se função has_role funciona
SELECT public.has_role(
  (SELECT id FROM auth.users WHERE email = 'admindoces@admin.com' LIMIT 1), 
  'admin'
) as has_admin_role;

-- 4. Remover políticas antigas da tabela products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- 5. Criar políticas corretas para products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    public.has_role(auth.uid(), 'admin')
  );

-- 6. Verificar se RLS está ativo
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 7. Verificar políticas criadas
SELECT 
  'Políticas products' as status,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- 8. Teste de inserção manual (comente se não quiser testar)
/*
INSERT INTO public.products (name, description, price, sort_order, image_url)
VALUES ('Teste Produto', 'Produto de teste', 10.00, 1, null)
ON CONFLICT DO NOTHING;
*/

-- 9. Verificar produtos
SELECT * FROM public.products ORDER BY created_at DESC LIMIT 5;
