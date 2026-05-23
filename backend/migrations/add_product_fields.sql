-- Add missing fields to products table for perfume details

-- Add notes column
ALTER TABLE products ADD COLUMN notes TEXT;

-- Add rating column
ALTER TABLE products ADD COLUMN rating DECIMAL(2, 1) DEFAULT 4.5;

-- Add reviews column
ALTER TABLE products ADD COLUMN reviews INT DEFAULT 0;

-- Add original_price column
ALTER TABLE products ADD COLUMN original_price DECIMAL(10, 2) DEFAULT NULL;

