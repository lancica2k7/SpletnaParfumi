import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './PaymentSuccess.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      navigate('/');
      return;
    }

    verifyPayment(paymentIntentId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  const verifyPayment = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/payment/payment-status/${paymentIntentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success && data.payment.status === 'succeeded') {
        setPaymentStatus(data.payment);
        clearCart();
      } else {
        setPaymentStatus({ error: true });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus({ error: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="result-container">
          <div className="spinner-large"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus?.error) {
    return (
      <div className="payment-result-page">
        <div className="result-container error">
          <div className="result-icon">❌</div>
          <h1>Payment Verification Failed</h1>
          <p>We couldn't verify your payment. Please contact support if you were charged.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page success-bg">
      <div className="result-container success">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>

        <h1>🎉 Payment Successful!</h1>
        <p className="success-message">
          Thank you for your purchase! Your order has been confirmed.
        </p>

        {paymentStatus && (
          <div className="payment-details">
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span className="amount">
                ${paymentStatus.amount ? Number(paymentStatus.amount).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="detail-row">
              <span>Payment ID:</span>
              <span className="payment-id">#{paymentStatus.id}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-badge">Completed</span>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
