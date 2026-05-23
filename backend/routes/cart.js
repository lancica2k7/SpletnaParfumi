const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.execute(
      `SELECT product_id, quantity, product_data 
       FROM cart_items 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Parse product_data JSON and format cart items
    const cartItems = items.map(item => ({
      ...JSON.parse(item.product_data),
      quantity: item.quantity
    }));

    res.json({
      success: true,
      cartItems
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart'
    });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const userId = req.user.id;
    const { product, quantity = 1 } = req.body;

    if (!product || !product.id) {
      return res.status(400).json({
        success: false,
        message: 'Product information required'
      });
    }

    // Check if item already exists in cart
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, product.id]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await pool.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // Insert new item
      await pool.execute(
        `INSERT INTO cart_items (user_id, product_id, quantity, product_data) 
         VALUES (?, ?, ?, ?)`,
        [userId, product.id, quantity, JSON.stringify(product)]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Update item quantity
router.put('/update/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await pool.execute(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
    } else {
      await pool.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    }

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// Clear entire cart
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// Sync cart (replace entire cart)
router.post('/sync', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems } = req.body;

    // Delete all existing items
    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    // Insert new items one by one (safer for JSON data)
    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        await pool.execute(
          `INSERT INTO cart_items (user_id, product_id, quantity, product_data) 
           VALUES (?, ?, ?, ?)`,
          [userId, item.id, item.quantity || 1, JSON.stringify(item)]
        );
      }
    }

    res.json({
      success: true,
      message: 'Cart synced'
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart'
    });
  }
});

module.exports = router;

