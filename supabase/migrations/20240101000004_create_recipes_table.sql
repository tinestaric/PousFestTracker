-- Create recipes table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drink_menu_id UUID NOT NULL REFERENCES drink_menu(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT[] NOT NULL, -- Array of ingredient strings
    instructions TEXT[] NOT NULL, -- Array of instruction steps
    video_url TEXT,
    prep_time VARCHAR(50),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    serves INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on drink_menu_id for faster lookups
CREATE INDEX idx_recipes_drink_menu_id ON recipes(drink_menu_id);

-- Create index on difficulty for filtering
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recipes for existing cocktails
INSERT INTO recipes (drink_menu_id, name, description, ingredients, instructions, video_url, prep_time, difficulty, serves) VALUES
-- Assuming we have cocktails in drink_menu, we'll need to match by name
((SELECT id FROM drink_menu WHERE name ILIKE '%mojito%' LIMIT 1), 
 'Classic Mojito', 
 'A refreshing Cuban cocktail with mint, lime, and rum',
 ARRAY['2 oz White rum', '1 oz Fresh lime juice', '2 tsp Sugar', '6-8 Fresh mint leaves', 'Soda water', 'Ice cubes', 'Lime wheel and mint sprig for garnish'],
 ARRAY['Add mint leaves and sugar to a highball glass', 'Gently muddle the mint to release oils (don''t over-muddle)', 'Add lime juice and rum', 'Fill glass with ice cubes', 'Top with soda water', 'Stir gently to combine', 'Garnish with lime wheel and fresh mint sprig'],
 'https://www.youtube.com/embed/4oiA7hW8QqQ',
 '5 min',
 'Easy',
 1),

((SELECT id FROM drink_menu WHERE name ILIKE '%margarita%' LIMIT 1),
 'Classic Margarita',
 'The perfect balance of tequila, lime, and orange liqueur',
 ARRAY['2 oz Blanco tequila', '1 oz Fresh lime juice', '1 oz Orange liqueur (Cointreau or Triple Sec)', '1/2 oz Simple syrup (optional)', 'Salt for rim', 'Ice cubes', 'Lime wheel for garnish'],
 ARRAY['Rim glass with salt (optional)', 'Add all ingredients to a shaker with ice', 'Shake vigorously for 10-15 seconds', 'Strain into a rocks glass over fresh ice', 'Garnish with lime wheel'],
 'https://www.youtube.com/embed/TZlTdFNjAx8',
 '3 min',
 'Easy',
 1),

((SELECT id FROM drink_menu WHERE name ILIKE '%old fashioned%' OR name ILIKE '%whiskey%' LIMIT 1),
 'Old Fashioned',
 'A timeless whiskey cocktail with bitters and sugar',
 ARRAY['2 oz Bourbon or rye whiskey', '1/4 oz Simple syrup', '2-3 dashes Angostura bitters', 'Orange peel', 'Ice cubes', 'Maraschino cherry (optional)'],
 ARRAY['Add simple syrup and bitters to a rocks glass', 'Add a large ice cube', 'Pour whiskey over ice', 'Stir gently for 30 seconds', 'Express orange peel oils over drink', 'Garnish with orange peel and cherry'],
 'https://www.youtube.com/embed/qhoGgKdYWkw',
 '4 min',
 'Medium',
 1);

-- Note: Only insert recipes if matching drinks exist in drink_menu
-- The SELECT subqueries will return NULL if no matching drinks are found,
-- and the INSERT will be skipped for those rows 