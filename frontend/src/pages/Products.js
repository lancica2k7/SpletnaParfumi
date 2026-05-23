import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './Products.css';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const productsPerPage = 12; // Show 12 products per page

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <h1>{language === 'sl' ? 'Naša Kolekcija Parfumov' : 'Our Perfume Collection'}</h1>
          <p>{language === 'sl' ? 'Odkrijte luksuzne dišave za vsako priložnost' : 'Discover luxury fragrances for every occasion'}</p>
        </div>

        <div className="products-filters">
          <div className="filter-group">
            <label>{t('filterByCategory')}:</label>
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${
                    selectedCategory === category ? 'active' : ''
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {t(category.toLowerCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>{t('sortBy')}:</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="default">{language === 'sl' ? 'Privzeto' : 'Default'}</option>
              <option value="price-low">{t('priceAsc')}</option>
              <option value="price-high">{t('priceDesc')}</option>
              <option value="rating">{language === 'sl' ? 'Najvišje Ocenjeni' : 'Highest Rated'}</option>
              <option value="name">{t('nameAsc')}</option>
            </select>
          </div>
        </div>

        <div className="products-count">
          {language === 'sl' 
            ? `Prikaz ${startIndex + 1}-${Math.min(endIndex, sortedProducts.length)} od ${sortedProducts.length} izdelkov`
            : `Showing ${startIndex + 1}-${Math.min(endIndex, sortedProducts.length)} of ${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`
          }
        </div>

        <div className="products-grid">
          {currentProducts.map((product) => (
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
                    <span className="price-current">${product.price}</span>
                    {product.originalPrice && (
                      <span className="price-original">
                        ${product.originalPrice}
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

        {sortedProducts.length === 0 && (
          <div className="no-products">
            <p>{language === 'sl' ? 'V tej kategoriji ni izdelkov.' : 'No products found in this category.'}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {t('previous')}
            </button>
            
            <div className="pagination-pages">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

