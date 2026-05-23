-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status ENUM('pending', 'succeeded', 'failed', 'canceled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_payment_intent (stripe_payment_intent_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add payment_id to orders table (if not exists)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id INT NULL,
ADD CONSTRAINT fk_payment_id 
  FOREIGN KEY (payment_id) REFERENCES payments(id) 
  ON DELETE SET NULL;

-- Add index for payment_id
CREATE INDEX IF NOT EXISTS idx_payment_id ON orders(payment_id);

