-- Create food_menu table
CREATE TABLE food_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'breakfast',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_orders table
CREATE TABLE food_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  food_menu_id UUID NOT NULL REFERENCES food_menu(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ordered',
  ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guest_id) -- Each guest can only have one food order
);

-- Create indexes for better performance
CREATE INDEX idx_food_orders_guest_id ON food_orders(guest_id);
CREATE INDEX idx_food_orders_food_menu_id ON food_orders(food_menu_id);
CREATE INDEX idx_food_menu_available ON food_menu(available);

-- Insert sample food menu items for day 2 breakfast
INSERT INTO food_menu (name, description, category, available) VALUES
  ('Jajčnica s pečico', 'Mehka jajčnica s svežim pečico in kruhom', 'breakfast', true),
  ('Palačinke s marmelado', 'Domače palačinke z jagodno marmelado', 'breakfast', true),
  ('Ovseni kosmiči z sadjem', 'Zdrav zajtrk z bananami in jagodami', 'breakfast', true),
  ('Croissant s šunko in sirom', 'Mehak croissant z narezom', 'breakfast', true),
  ('Jogurt z granolo', 'Grški jogurt s hruškavimi kosmiči', 'breakfast', true),
  ('Sendvič s tunino', 'Sveži sendvič z mešano solato', 'breakfast', true); 