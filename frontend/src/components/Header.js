import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const cartCount = getCartItemsCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">Parfumerija CICKO</span>
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            {t('home')}
          </Link>
          <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            {t('products')}
          </Link>
          {isAuthenticated ? (
            <>
              {/* Admin Dashboard Link - Only for admins and moderators */}
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Link 
                  to="/admin" 
                  className="nav-link admin-link" 
                  onClick={() => setIsMenuOpen(false)}
                >
                    {t('adminDashboard')}
                </Link>
              )}
              <span className="nav-user">
                {user?.firstName} {user?.lastName}
              </span>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                {t('login')}
              </Link>
              <Link to="/register" className="nav-link register-link" onClick={() => setIsMenuOpen(false)}>
                {t('register')}
              </Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="language-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            {language === 'en' ? 'SLO' : 'ENG'}
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀ Light' : '☾ Dark'}
          </button>

          <button
            className="cart-button"
            onClick={() => navigate('/cart')}
            aria-label="Shopping cart"
          >
            <span className="cart-icon">♦</span>
            <span>{t('cart')}</span>
            {cartCount > 0 && (
              <span key={cartCount} className="cart-badge">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
