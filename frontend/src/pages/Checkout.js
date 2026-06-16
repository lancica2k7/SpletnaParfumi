import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutForm from '../components/CheckoutForm';
import './Checkout.css';

const API_URL = process.env.REACT_APP_API_URL || '${API_URL}';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_key');

const Checkout = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Create payment intent
    createPaymentIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, user, navigate]);

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${API_URL}/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error creating payment intent:', err);
    } finally {
      setLoading(false);
    }
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-loading">
            <div className="spinner"></div>
            <p>Preparing checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-error">
            <h2>⚠️ Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/cart')} className="btn-back">
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => navigate('/cart')} className="btn-back-small">
            ← Back to Cart
          </button>
          <h1>🔒 Secure Checkout</h1>
          <p>Complete your purchase securely with Stripe</p>
        </div>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-section">
            <h2>Payment Details</h2>
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

