-- Fix placements table - make photo field nullable
ALTER TABLE placements ALTER COLUMN photo DROP NOT NULL; 