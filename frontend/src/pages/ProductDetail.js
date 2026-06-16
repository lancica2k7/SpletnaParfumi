import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find((p) => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>{language === 'sl' ? 'Izdelek ni najden' : 'Product not found'}</h2>
        <button onClick={() => navigate('/products')}>{language === 'sl' ? 'Nazaj na Izdelke' : 'Back to Products'}</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const images = product.images || [product.image, product.image, product.image];

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          {t('back')}
        </button>

        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              <img src={images[selectedImage]} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} view ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          <div className="product-details">
            <p className="product-brand">{product.brand}</p>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <span className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </span>
              <span className="rating-text">
                {product.rating} ({product.reviews} {t('reviews')})
              </span>
            </div>

            <div className="product-price-section">
              <span className="price-current">€{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="price-original">€{product.originalPrice}</span>
                  <span className="discount-badge">
                    {language === 'sl' ? 'Prihranek' : 'Save'} €{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="product-description">
              <h3>{t('description')}</h3>
              <p>{language === 'sl' ? product.descriptionSl : product.description}</p>
            </div>

            <div className="product-notes">
              <h3>{t('fragranceNotes')}</h3>
              <p>{language === 'sl' ? product.notesSl : product.notes}</p>
            </div>

            <div className="product-info-grid">
              <div className="info-item">
                <span className="info-label">{t('category')}:</span>
                <span className="info-value">{t(product.category.toLowerCase())}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('availability')}:</span>
                <span className="info-value">
                  {product.inStock ? t('inStock') : t('outOfStock')}
                </span>
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>{t('quantity')}:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity === 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <button
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock ? t('addToCart') : t('outOfStock')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

