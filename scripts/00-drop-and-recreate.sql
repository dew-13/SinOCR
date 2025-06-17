-- Drop all existing tables and recreate the database schema
-- WARNING: This will delete all existing data

-- Drop tables in correct order (reverse of dependencies)
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate everything from scratch
-- This ensures a clean database state
SELECT 'Database cleaned successfully' as status;
