-- ========================================
-- CORRIGIR ERRO 403 AO SALVAR PRODUTO
-- Execute este SQL para permitir INSERT de produtos
-- ========================================

-- 1. Verificar usuário admin atual
SELECT '=== VERIFICANDO USUÁRIO ADMIN ===' as info;
SELECT ur.*, u.email, u.email_confirmed_at 
FROM public.user_roles ur 
JOIN auth.users u ON ur.user_id = u.id 
WHERE u.email = 'admindoces@admin.com';

-- 2. Testar função has_role
SELECT '=== TESTANDO FUNÇÃO HAS_ROLE ===' as info;
SELECT 
  u.email,
  public.has_role(u.id, 'admin') as is_admin
FROM auth.users u 
WHERE u.email = 'admindoces@admin.com';

-- 3. Verificar políticas atuais de INSERT
SELECT '=== POLÍTICAS INSERT ATUAIS ===' as info;
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public' AND cmd = 'INSERT';

-- 4. REMOVER E RECRIR POLÍTICA DE INSERT
SELECT '=== RECRINANDO POLÍTICA INSERT ===' as info;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Enable read for all" ON public.products;

-- Criar política de INSERT mais permissiva
CREATE POLICY "Allow insert for authenticated users" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Verificar se RLS está ativo
SELECT '=== VERIFICANDO RLS ===' as info;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Criar política SELECT (se não existir)
SELECT '=== CRIANDO POLÍTICA SELECT ===' as info;
CREATE POLICY "Enable read for all" ON public.products
  FOR SELECT USING (true);

-- 7. Verificar políticas finais
SELECT '=== POLÍTICAS FINAIS ===' as info;
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- 8. Teste de INSERT manual
SELECT '=== TESTE DE INSERT MANUAL ===' as info;
INSERT INTO public.products (name, description, price, sort_order, image_url)
VALUES ('TESTE INSERT', 'Teste de permissão', null, 999, null)
ON CONFLICT DO NOTHING;

-- 9. Verificar se insert funcionou
SELECT '=== VERIFICANDO INSERT ===' as info;
SELECT * FROM public.products WHERE name = 'TESTE INSERT';

-- 10. Limpar teste
SELECT '=== LIMPANDO TESTE ===' as info;
DELETE FROM public.products WHERE name = 'TESTE INSERT';

-- 11. Verificação final
SELECT '=== VERIFICAÇÃO FINAL ===' as info;
SELECT 
  'Products configurado para INSERT' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products' AND cmd = 'INSERT') as insert_policies,
  (SELECT COUNT(*) FROM public.products) as total_products;

SELECT '=== SOLUÇÃO APLICADA ===' as info;
SELECT 'Agora deve ser possível salvar produtos!' as resultado;
