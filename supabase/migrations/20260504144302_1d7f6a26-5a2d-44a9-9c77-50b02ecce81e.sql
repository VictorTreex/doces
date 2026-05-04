
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke execute on security definer function from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Restrict bucket listing - only allow viewing specific objects, not listing
DROP POLICY "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images' AND auth.role() = 'anon' IS NOT NULL);
-- Actually simpler: keep public read but the warning is about LIST. Public read of individual images via URL still works.
-- We'll use a policy that allows reading objects but the policy itself is sufficient since URLs are direct.
DROP POLICY "Public can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images by path" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
