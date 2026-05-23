-- Add role column to users table
-- Run this in MySQL command line or phpMyAdmin

USE perfume_paradise;

-- Add the role column
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'moderator', 'admin') DEFAULT 'user' 
AFTER phone;

-- Add index for better performance
ALTER TABLE users ADD INDEX idx_role (role);

-- Set all existing users to 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Verify the column was added
DESCRIBE users;

-- Now you can make yourself admin
-- (Replace 'your-email@example.com' with your actual email)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Check it worked
SELECT id, email, CONCAT(first_name, ' ', last_name) as name, role FROM users;

