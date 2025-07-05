-- Create guests table
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tag_uid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievement_templates table
CREATE TABLE achievement_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  from_time TIMESTAMP WITH TIME ZONE NOT NULL,
  to_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guest_achievements table
CREATE TABLE guest_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  achievement_template_id UUID NOT NULL REFERENCES achievement_templates(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guest_id, achievement_template_id)
);

-- Create drink_menu table
CREATE TABLE drink_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drink_orders table
CREATE TABLE drink_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  drink_menu_id UUID NOT NULL REFERENCES drink_menu(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'logged',
  ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_guests_tag_uid ON guests(tag_uid);
CREATE INDEX idx_guest_achievements_guest_id ON guest_achievements(guest_id);
CREATE INDEX idx_guest_achievements_template_id ON guest_achievements(achievement_template_id);
CREATE INDEX idx_drink_orders_guest_id ON drink_orders(guest_id);
CREATE INDEX idx_drink_orders_drink_menu_id ON drink_orders(drink_menu_id);
CREATE INDEX idx_achievement_templates_time ON achievement_templates(from_time, to_time);

-- Insert sample achievement templates
INSERT INTO achievement_templates (achievement_type, title, description, logo_url, from_time, to_time) VALUES
  ('early_arrival', 'Early Bird', 'Arrived early to get the party started!', '/icons/early-bird.png', '2024-01-01 18:00:00+00', '2024-01-01 20:00:00+00'),
  ('pool_party', 'Pool Party Champion', 'Made a splash at the pool party!', '/icons/pool-party.png', '2024-01-01 14:00:00+00', '2024-01-01 18:00:00+00'),
  ('night_owl', 'Night Owl', 'Still going strong late into the night!', '/icons/night-owl.png', '2024-01-01 23:00:00+00', '2024-01-02 02:00:00+00'),
  ('morning_after', 'Morning Warrior', 'Up bright and early after a great night!', '/icons/morning-warrior.png', '2024-01-02 08:00:00+00', '2024-01-02 10:00:00+00'),
  ('social_butterfly', 'Social Butterfly', 'Mingling and making friends all day!', '/icons/social-butterfly.png', '2024-01-01 12:00:00+00', '2024-01-02 00:00:00+00'),
  ('party_animal', 'Party Animal', 'Living it up at the main event!', '/icons/party-animal.png', '2024-01-01 20:00:00+00', '2024-01-02 01:00:00+00');

-- Insert sample drink menu items
INSERT INTO drink_menu (name, description, category, available) VALUES
  ('Mojito', 'Fresh mint and lime cocktail', 'cocktail', true),
  ('Heineken', 'Classic Dutch beer', 'beer', true),
  ('Jager Shot', 'Herbal liqueur shot', 'shot', true),
  ('Vodka Tonic', 'Crisp vodka with tonic water', 'cocktail', true),
  ('Piña Colada', 'Tropical coconut and pineapple', 'cocktail', true),
  ('Corona', 'Light Mexican beer with lime', 'beer', true),
  ('Tequila Shot', 'Premium tequila shot', 'shot', true),
  ('Gin & Tonic', 'Classic gin cocktail', 'cocktail', true),
  ('Whiskey Sour', 'Smooth whiskey with lemon', 'cocktail', true),
  ('Red Bull', 'Energy drink', 'non-alcoholic', true),
  ('Water', 'Stay hydrated!', 'non-alcoholic', true),
  ('Sangria', 'Fruity wine cocktail', 'cocktail', true); 