-- 1. Create menu_items table in Supabase
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cakes', 'fudge', 'brownies', 'cupcakes'
  pricing TEXT NOT NULL, -- e.g. 'Pack of 3: Rs. 450 | Pack of 6: Rs. 900'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed existing default menu items
INSERT INTO menu_items (name, category, pricing) VALUES
('Vanilla Cake', 'cakes', 'Per Pound: Rs. 1,000'),
('Chocolate Cream Cake', 'cakes', 'Per Pound: Rs. 1,100'),
('Caramel Cake', 'cakes', 'Per Pound: Rs. 1,100'),
('Pineapple Cake', 'cakes', 'Per Pound: Rs. 1,000'),
('Red Velvet Cake', 'cakes', 'Half Pound: Rs. 1,000 | 1 Pound: Rs. 2,000'),
('Chocolate Fudge', 'fudge', 'Half Pound: Rs. 800 | 1 Pound: Rs. 1,500'),
('Walmond Fudge Cake', 'fudge', 'Half Pound: Rs. 900 | 1 Pound: Rs. 1,600'),
('Oreo Choc Drip Cake', 'fudge', 'Half Pound: Rs. 750 | 1 Pound: Rs. 1,000'),
('Fudge Brownie', 'brownies', '3x3 · 6 Pieces: Rs. 900'),
('Walnut Brownie', 'brownies', '3x3 · 6 Pieces: Rs. 1,100'),
('Simple Brownie', 'brownies', '3x3 · 6 Pieces: Rs. 1,000'),
('Vanilla Cupcake', 'cupcakes', 'Pack of 3: Rs. 450 | Pack of 6: Rs. 900'),
('Chocolate Cupcake', 'cupcakes', 'Pack of 3: Rs. 500 | Pack of 6: Rs. 1,000');
