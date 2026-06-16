import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">{t('welcomeTitle')}</h1>
          <p className="hero-subtitle">
            {t('welcomeSubtitle')}
          </p>
          <Link to="/products" className="hero-button">
            {t('shopNow')}
          </Link>
        </div>
        <div className="hero-image">
          <div className="hero-gradient"></div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature">
            <span className="feature-icon">📦</span>
            <h3>{language === 'sl' ? 'Brezplačna Dostava' : 'Free Shipping'}</h3>
            <p>{language === 'sl' ? 'Pri naročilih nad 50€' : 'On orders over $50'}</p>
          </div>
          <div className="feature">
            <span className="feature-icon">↩</span>
            <h3>{language === 'sl' ? 'Enostavne Vračila' : 'Easy Returns'}</h3>
            <p>{language === 'sl' ? '30-dnevna politika vračila' : '30-day return policy'}</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔐</span>
            <h3>{language === 'sl' ? 'Varno Plačilo' : 'Secure Payment'}</h3>
            <p>{language === 'sl' ? '100% varna blagajna' : '100% secure checkout'}</p>
          </div>
          <div className="feature">
            <span className="feature-icon">★</span>
            <h3>{language === 'sl' ? 'Premium Kakovost' : 'Premium Quality'}</h3>
            <p>{language === 'sl' ? 'Pristni luksuzni parfumi' : 'Authentic luxury fragrances'}</p>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="section-container">
          <h2 className="section-title">{t('featuredProducts')}</h2>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="product-link">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      decoding="async"
                    />
                    {product.originalPrice && (
                      <span className="product-badge">
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>
                  <div className="product-info">
                    <p className="product-brand">{product.brand}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </span>
                      <span className="rating-text">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                    <div className="product-price">
                      <span className="price-current">€{product.price}</span>
                      {product.originalPrice && (
                        <span className="price-original">
                          €{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  {t('addToCart')}
                </button>
              </div>
            ))}
          </div>
          <div className="view-all-container">
            <Link to="/products" className="view-all-button">
              {language === 'sl' ? 'Poglej Vse Izdelke' : 'View All Products'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

