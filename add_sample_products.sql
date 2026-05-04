-- ========================================
-- ADICIONAR PRODUTOS DE EXEMPLO
-- Execute este SQL para adicionar produtos ao banco
-- ========================================

INSERT INTO public.products (name, description, price, sort_order, image_url) VALUES
('Brigadeiro Gourmet', 'Brigadeiro tradicional com leite ninho e granulado', 2.50, 1, null),
('Beijinho', 'Beijinho cremoso com coco ralado', 2.00, 2, null),
('Olho de Sogra', 'Doce tradicional com ameixa e coco', 3.00, 3, null),
('Pudim de Leite', 'Pudim cremoso com calda de caramelo', 15.00, 4, null),
('Quindim', 'Quindim dourado com coco', 4.50, 5, null),
('Bolo de Fubá', 'Bolo fofinho de fubá com goiabada', 25.00, 6, null),
('Pé de Moleque', 'Pé de moleque crocante com amendoim', 1.50, 7, null),
('Paçoca', 'Paçoca tradicional de amendoim', 1.00, 8, null);

-- Verificar se foram adicionados
SELECT * FROM public.products ORDER BY sort_order, created_at;
