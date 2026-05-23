const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', items } = req.body;
    const userId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId.toString(),
        items: JSON.stringify(items || [])
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store pending payment in database
    await pool.execute(
      `INSERT INTO payments (user_id, stripe_payment_intent_id, amount, currency, status, created_at) 
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [userId, paymentIntent.id, amount, currency]
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// Get payment status and create order if needed
router.get('/payment-status/:paymentIntentId', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    // Get payment from database
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = ? AND user_id = ?',
      [paymentIntentId, req.user.id]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = payments[0];

    // Get payment from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If payment succeeded and order doesn't exist yet, create it
    if (paymentIntent.status === 'succeeded') {
      // Check if order already exists for this payment
      const [existingOrders] = await pool.execute(
        'SELECT id FROM orders WHERE payment_id = ?',
        [payment.id]
      );

      if (existingOrders.length === 0) {
        // Create order with transaction
        await createOrderForPayment(payment.id, payment.user_id, payment.amount);
        console.log(`✅ Order created for payment ${paymentIntentId}`);
      }

      // Update payment status to succeeded
      await pool.execute(
        'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?',
        ['succeeded', payment.id]
      );
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: paymentIntent.status,
        amount: payment.amount,
        currency: payment.currency,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
});

// Get user's payment history
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      `SELECT id, stripe_payment_intent_id, amount, currency, status, created_at, updated_at 
       FROM payments 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper function to create order for a payment
async function createOrderForPayment(paymentId, userId, amount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get user info
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Create order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, customer_name, customer_email, total, status, payment_id, created_at) 
       VALUES (?, ?, ?, ?, 'completed', ?, NOW())`,
      [
        userId,
        `${user.first_name} ${user.last_name}`,
        user.email,
        amount,
        paymentId
      ]
    );

    const orderId = orderResult.insertId;

    // Get cart items (with product_data JSON)
    const [cartItems] = await connection.execute(
      'SELECT product_id, quantity, product_data FROM cart_items WHERE user_id = ?',
      [userId]
    );

    // Create order items from cart
    for (const item of cartItems) {
      const productData = JSON.parse(item.product_data);
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price, product_name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, productData.price || 0, productData.name || 'Unknown Product']
      );
    }

    // Clear cart after successful order
    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await connection.commit();
    console.log(`✅ Order #${orderId} created successfully for payment ID ${paymentId}`);
    return orderId;
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order for payment:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Helper functions for webhooks
async function handlePaymentSuccess(paymentIntent) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update payment status
    await connection.execute(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE stripe_payment_intent_id = ?',
      ['succeeded', paymentIntent.id]
    );

    // Get payment info
    const [payments] = await connection.execute(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = ?',
      [paymentIntent.id]
    );

    if (payments.length > 0) {
      const payment = payments[0];

      // Check if order already exists
      const [existingOrders] = await connection.execute(
        'SELECT id FROM orders WHERE payment_id = ?',
        [payment.id]
      );

      if (existingOrders.length === 0) {
        // Create order using the helper function
        await createOrderForPayment(payment.id, payment.user_id, payment.amount);
      } else {
        console.log(`ℹ️ Order already exists for payment ${paymentIntent.id}`);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error handling payment success:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    await pool.execute(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE stripe_payment_intent_id = ?',
      ['failed', paymentIntent.id]
    );
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  try {
    await pool.execute(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE stripe_payment_intent_id = ?',
      ['canceled', paymentIntent.id]
    );
    console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

module.exports = router;

