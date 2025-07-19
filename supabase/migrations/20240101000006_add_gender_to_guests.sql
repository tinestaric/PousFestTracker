-- Add gender column to guests table with constraint
ALTER TABLE guests ADD COLUMN gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female'));

-- Create an index for better performance when filtering by gender
CREATE INDEX idx_guests_gender ON guests(gender);

-- Update existing guests with gender based on names from the CSV file
-- All female names identified from the guest list
UPDATE guests SET gender = 'female' WHERE name IN (
  'Manca Bavdek',
  'Nina Povše', 
  'Darja Prošek',
  'Daša Kovačič',
  'Tanja Gruden',
  'Nuša Ferkov',
  'Brina Gruden',
  'Vesna Zakrajšek',
  'Kaja Klasinc',
  'Mija Starič',
  'Staška Udvanc',
  'Andreja Leški',
  'Ajda Ahačič',
  'Lucija Drnovscek',
  'Maja Železnik',
  'Natalija Tanodi',
  'Nina Zadravec',
  'Pia Požek',
  'Uršika Holešek',
  'Lara Mlakar',
  'Maja Podojsteršek',
  'Medeja Žnidarec Kraševec'
);

-- Additional pattern-based updates for common Slovenian female names
-- This catches any names we might have missed in the exact list
UPDATE guests SET gender = 'female' 
WHERE gender = 'male' 
AND (
  name ILIKE 'Nina %' OR
  name ILIKE 'Manca %' OR 
  name ILIKE 'Darja %' OR
  name ILIKE 'Daša %' OR
  name ILIKE 'Tanja %' OR
  name ILIKE 'Nuša %' OR
  name ILIKE 'Brina %' OR
  name ILIKE 'Kaja %' OR
  name ILIKE 'Mija %' OR
  name ILIKE 'Staška %' OR
  name ILIKE 'Andreja %' OR
  name ILIKE 'Ajda %' OR
  name ILIKE 'Lucija %' OR
  name ILIKE 'Maja %' OR
  name ILIKE 'Natalija %' OR
  name ILIKE 'Pia %' OR
  name ILIKE 'Uršika %' OR
  name ILIKE 'Lara %' OR
  name ILIKE 'Medeja %' OR
  name ILIKE 'Vesna %' OR
  name ILIKE 'Ana %' OR
  name ILIKE 'Eva %' OR
  name ILIKE 'Sara %' OR
  name ILIKE 'Petra %' OR
  name ILIKE 'Katja %' OR
  name ILIKE 'Špela %' OR
  name ILIKE 'Tina %'
);

-- Comment on the column for documentation
COMMENT ON COLUMN guests.gender IS 'Gender of the guest for personalized greetings (Dobrodošel/Dobrodošla). Values: male, female';

-- Show summary of gender distribution after update
-- This will be displayed in the migration results
DO $$
DECLARE
    male_count INTEGER;
    female_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO male_count FROM guests WHERE gender = 'male';
    SELECT COUNT(*) INTO female_count FROM guests WHERE gender = 'female';
    SELECT COUNT(*) INTO total_count FROM guests;
    
    RAISE NOTICE 'Gender assignment completed:';
    RAISE NOTICE '- Male guests: %', male_count;
    RAISE NOTICE '- Female guests: %', female_count;
    RAISE NOTICE '- Total guests: %', total_count;
END $$; 