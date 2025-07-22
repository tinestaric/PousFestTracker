-- Add alcohol percentage and content fields to drink_menu table
ALTER TABLE drink_menu 
ADD COLUMN alcohol_percentage DECIMAL(4,2) DEFAULT 0.0,
ADD COLUMN alcohol_content_ml DECIMAL(6,2) DEFAULT 0.0;

-- Add comments for clarity
COMMENT ON COLUMN drink_menu.alcohol_percentage IS 'Alcohol by volume percentage (e.g. 5.2 for beer, 35.0 for spirits, 0.0 for non-alcoholic)';
COMMENT ON COLUMN drink_menu.alcohol_content_ml IS 'Volume of liquid in milliliters (e.g. 500ml for beer, 40ml for shot, 250ml for cocktail)';

-- Update existing drinks with accurate alcohol data based on actual menu

-- Cocktails (based on recipes from cocktails.csv)
UPDATE drink_menu SET alcohol_percentage = 11.0, alcohol_content_ml = 150.0 WHERE name = 'Aperol Spritz';
UPDATE drink_menu SET alcohol_percentage = 25.0, alcohol_content_ml = 200.0 WHERE name = 'Black Devil''s Ice Tea';
UPDATE drink_menu SET alcohol_percentage = 30.0, alcohol_content_ml = 250.0 WHERE name = 'Cherry Bitherinho';
UPDATE drink_menu SET alcohol_percentage = 20.0, alcohol_content_ml = 180.0 WHERE name = 'Red Bull Vodka';
UPDATE drink_menu SET alcohol_percentage = 23.0, alcohol_content_ml = 160.0 WHERE name = 'Klasični Gin Tonik';
UPDATE drink_menu SET alcohol_percentage = 15.0, alcohol_content_ml = 180.0 WHERE name = 'Moscow Mule';
UPDATE drink_menu SET alcohol_percentage = 18.0, alcohol_content_ml = 170.0 WHERE name = 'Rum & Cola (Cuba Libre)';

-- Beers (500ml bottles, except Nord which is 330ml)
UPDATE drink_menu SET alcohol_percentage = 5.2, alcohol_content_ml = 500.0 WHERE name = 'Pivo Laško';
UPDATE drink_menu SET alcohol_percentage = 5.0, alcohol_content_ml = 500.0 WHERE name = 'Pivo Union';
UPDATE drink_menu SET alcohol_percentage = 4.5, alcohol_content_ml = 330.0 WHERE name = 'Nord';
UPDATE drink_menu SET alcohol_percentage = 2.0, alcohol_content_ml = 500.0 WHERE name = 'Radler Grenivka';

-- Shots (20ml each as mentioned)
UPDATE drink_menu SET alcohol_percentage = 35.0, alcohol_content_ml = 20.0 WHERE name = 'Jägermeister';
UPDATE drink_menu SET alcohol_percentage = 40.0, alcohol_content_ml = 20.0 WHERE name = 'Borovničke';
UPDATE drink_menu SET alcohol_percentage = 40.0, alcohol_content_ml = 20.0 WHERE name = 'Šamar';
UPDATE drink_menu SET alcohol_percentage = 35.0, alcohol_content_ml = 20.0 WHERE name = 'Pelinkovec';

-- Non-alcoholic drinks
UPDATE drink_menu SET alcohol_percentage = 0.0, alcohol_content_ml = 0.0 WHERE name = 'Radler Isotonic (0.0%)';
UPDATE drink_menu SET alcohol_percentage = 0.0, alcohol_content_ml = 0.0 WHERE name = 'Pivo Heineken 0.0';
UPDATE drink_menu SET alcohol_percentage = 0.0, alcohol_content_ml = 500.0 WHERE name = 'Voda';
UPDATE drink_menu SET alcohol_percentage = 0.0, alcohol_content_ml = 250.0 WHERE name = 'Red Bull';
UPDATE drink_menu SET alcohol_percentage = 0.0, alcohol_content_ml = 330.0 WHERE name = 'Ledeni čaj';

-- Create index for alcohol queries
CREATE INDEX idx_drink_menu_alcohol_percentage ON drink_menu(alcohol_percentage);
