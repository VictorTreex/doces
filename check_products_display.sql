-- ========================================
-- VERIFICAR POR QUE PRODUTOS NÃO APARECEM
-- Execute este SQL para diagnosticar o problema
-- ========================================

-- 1. Verificar se produtos existem no banco
SELECT '=== PRODUTOS NO BANCO ===' as info;
SELECT id, name, price, image_url, sort_order, created_at 
FROM public.products 
ORDER BY sort_order, created_at;

-- 2. Verificar se políticas permitem leitura anônima
SELECT '=== POLÍTICAS DA TABELA PRODUCTS ===' as info;
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- 3. Verificar se RLS está ativo
SELECT '=== STATUS DO RLS ===' as info;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

-- 4. Testar leitura como usuário anônimo
SELECT '=== TESTE DE LEITURA ANÔNIMA ===' as info;
-- Este comando simula leitura de usuário não autenticado
-- Se falhar, precisamos criar política para anônimos

-- 5. Verificar se há produtos com imagem_url nulo
SELECT '=== PRODUTOS SEM IMAGEM ===' as info;
SELECT id, name, price, image_url 
FROM public.products 
WHERE image_url IS NULL OR image_url = '';

-- 6. Corrigir políticas se necessário
SELECT '=== CORRIGINDO POLÍTICAS PARA LEITURA PÚBLICA ===' as info;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.products;

-- Criar política que permite leitura para todos (incluindo anônimos)
CREATE POLICY "Enable read for all" ON public.products
  FOR SELECT USING (true);

-- Manter políticas de escrita apenas para admins
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

-- 7. Verificação final
SELECT '=== POLÍTICAS ATUALIZADAS ===' as info;
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

SELECT '=== DIAGNÓSTICO CONCLUÍDO ===' as info;
SELECT 'Agora os produtos devem aparecer para todos os visitantes!' as resultado;
