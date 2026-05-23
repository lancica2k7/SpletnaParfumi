import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Parfumerija CICKO</h3>
          <p>Your destination for luxury fragrances</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/cart">Cart</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@perfumeparadise.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Perfume Paradise. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

