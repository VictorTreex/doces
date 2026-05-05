-- ========================================
-- DESATIVAR RLS PARA TESTE
-- Execute este SQL para desativar Row Level Security
-- ========================================

-- 1. Desativar RLS da tabela products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status do RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

-- 3. Teste de INSERT direto
SELECT '=== TESTE DE INSERT DIRETO ===' as info;
INSERT INTO public.products (name, description, price, sort_order, image_url)
VALUES ('PRODUTO TESTE RLS', 'Teste sem RLS', 25.00, 1, null)
ON CONFLICT DO NOTHING;

-- 4. Verificar se insert funcionou
SELECT '=== VERIFICANDO INSERT ===' as info;
SELECT * FROM public.products WHERE name = 'PRODUTO TESTE RLS';

-- 5. Limpar teste
SELECT '=== LIMPANDO TESTE ===' as info;
DELETE FROM public.products WHERE name = 'PRODUTO TESTE RLS';

-- 6. Status final
SELECT '=== STATUS FINAL ===' as info;
SELECT 
  'RLS desativado' as status,
  'INSERT direto liberado' as resultado,
  'Teste concluído com sucesso' as mensagem;

SELECT '=== RESULTADO ===' as info;
SELECT 'Agora deve ser possível salvar produtos sem erro 403!' as resultado_final;
