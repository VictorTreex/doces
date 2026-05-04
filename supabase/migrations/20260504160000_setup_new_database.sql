-- ========================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- Império Doces Distribuidora
-- Projeto: koekajyqqssamswobwbv
-- ========================================

-- 1. CRIAR TIPO ENUM PARA ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. TABELA DE ROLES DOS USUÁRIOS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÃO PARA VERIFICAR ROLES
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 4. POLÍTICAS PARA user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. TABELA DE PRODUTOS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS PARA products
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. TRIGGER PARA updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. STORAGE BUCKET PARA IMAGENS
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- 9. POLÍTICAS PARA STORAGE
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- 10. REVOGAR PERMISSÕES INSEGURAS
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
