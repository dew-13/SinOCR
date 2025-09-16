-- Update existing users with properly hashed passwords
-- This script will update the password_hash for existing users

-- Update owner user with hashed password for 'admin123'
UPDATE users 
SET password_hash = '$2b$10$Y0CeBBHUjyiSFBsvvAQZ.uuSGObTGSVVdDI3jBMW6.LwgtPuZPQLa'
WHERE email = 'owner@system.com';

-- If the owner user doesn't exist, insert it
INSERT INTO users (email, password_hash, full_name, role) 
SELECT 'owner@system.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuLd6RdGWQcC/KmxdCCUOvJ/KUEYjKim', 'System Owner', 'owner'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@system.com');

-- Remove any duplicate or invalid entries
DELETE FROM users WHERE email = 'owners@system.com';

-- Verify the update
SELECT id, email, full_name, role, 
       CASE 
         WHEN password_hash = '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuLd6RdGWQcC/KmxdCCUOvJ/KUEYjKim' 
         THEN 'Password Updated' 
         ELSE 'Password NOT Updated' 
       END as password_status
FROM users 
WHERE email = 'owner@system.com';
