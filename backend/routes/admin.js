const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { requireAdmin, requireAdminOnly } = require('../middleware/admin');

// Get dashboard statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get total users
    const [totalUsersResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM users'
    );
    const totalUsers = totalUsersResult[0].count;

    // Get active users (logged in within last 30 days)
    const [activeUsersResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    const activeUsers = activeUsersResult[0].count;

    // Get total revenue from completed orders
    const [revenueResult] = await pool.execute(
      'SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = "completed"'
    );
    const totalRevenue = parseFloat(revenueResult[0].total) || 0;
    
    console.log('📊 Admin Stats - Total Revenue:', totalRevenue);

    // Get orders today
    const [ordersTodayResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    );
    const ordersToday = ordersTodayResult[0].count;

    res.json({
      success: true,
      totalUsers,
      activeUsers,
      totalRevenue,
      ordersToday
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        role,
        CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END as status,
        COALESCE(DATE_FORMAT(last_login, '%Y-%m-%d %H:%i'), '—') as lastLogin,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get all orders
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.customer_name as customer,
        o.customer_email,
        o.total,
        o.status,
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i') as date,
        o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get order details with items
router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.shipping_address,
        o.total,
        o.status,
        o.payment_id,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.id = ?
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.execute(`
      SELECT 
        oi.id,
        oi.product_id,
        oi.product_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) as subtotal
      FROM order_items oi
      WHERE oi.order_id = ?
    `, [id]);

    res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// Get all products
router.get('/products', requireAdmin, async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT 
        id,
        name,
        brand,
        description,
        price,
        original_price,
        stock,
        category,
        image_url,
        notes,
        rating,
        reviews,
        is_active,
        created_at
      FROM products
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Update user (admin only)
router.put('/users/:id', requireAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role, is_active } = req.body;

    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [first_name, last_name, email, role, is_active, id]
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', requireAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Update order status
router.put('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

// Delete order (admin only)
router.delete('/orders/:id', requireAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // First delete order items
    await pool.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
    
    // Then delete the order
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});

// Create product (admin only)
router.post('/products', requireAdminOnly, async (req, res) => {
  try {
    const { name, brand, description, price, originalPrice, category, image_url, notes, rating, reviews } = req.body;

    // Validate required fields
    if (!name || !brand || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, price, and category are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO products (name, brand, description, price, original_price, category, image_url, notes, rating, reviews, stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        brand, 
        description || '', 
        price, 
        originalPrice || null,
        category, 
        image_url || '', 
        notes || '', 
        rating || 4.5,
        reviews || 0,
        100 // default stock
      ]
    );

    res.json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product (admin only)
router.put('/products/:id', requireAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, brand, image_url, is_active } = req.body;

    await pool.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, brand = ?, image_url = ?, is_active = ? WHERE id = ?',
      [name, description, price, stock, category, brand, image_url, is_active, id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product (admin only)
router.delete('/products/:id', requireAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

module.exports = router;

