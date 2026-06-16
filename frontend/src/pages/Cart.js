import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Cart.css';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      // Save cart and redirect to login
      alert(language === 'sl' ? 'Prosimo prijavite se za nadaljevanje' : 'Please login to proceed with checkout');
      navigate('/login');
    } else {
      // Proceed to checkout
      navigate('/checkout');
    }
  };

  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 9.99;
  const finalTotal = total + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>{t('emptyCart')}</h2>
          <p>{language === 'sl' ? 'Začnite z nakupovanjem in dodajte izdelke v košarico' : 'Start shopping to add items to your cart'}</p>
          <Link to="/products" className="shop-button">
            {language === 'sl' ? 'Prebrskaj Izdelke' : 'Browse Products'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>{t('shoppingCart')}</h1>
          <button className="clear-cart-button" onClick={clearCart}>
            {language === 'sl' ? 'Izprazni Košarico' : 'Clear Cart'}
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <Link to={`/products/${item.id}`} className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-item-details">
                  <Link to={`/products/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-brand">{item.brand}</p>
                  <p className="cart-item-price">€{item.price}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <p>€{(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  className="remove-item-button"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>{language === 'sl' ? 'Povzetek Naročila' : 'Order Summary'}</h2>
            <div className="summary-row">
              <span>{t('subtotal')}:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>{t('shipping')}:</span>
              <span>
                {shipping === 0 ? (
                  <span className="free-shipping">{language === 'sl' ? 'BREZPLAČNO' : 'FREE'}</span>
                ) : (
                  `€${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {total < 50 && (
              <p className="shipping-note">
                {language === 'sl' 
                  ? `Dodaj še €${(50 - total).toFixed(2)} za brezplačno dostavo!`
                  : `Add €${(50 - total).toFixed(2)} more for free shipping!`
                }
              </p>
            )}
            <div className="summary-row total">
              <span>{t('total')}:</span>
              <span>€{finalTotal.toFixed(2)}</span>
            </div>
            <button
              className="checkout-button"
              onClick={handleCheckout}
            >
              {t('proceedToCheckout')}
            </button>
            <Link to="/products" className="continue-shopping">
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

