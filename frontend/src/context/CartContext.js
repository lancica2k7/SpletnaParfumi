import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from database when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartFromDatabase();
    } else {
      // Load from localStorage for guest users
      const saved = localStorage.getItem('cartItems');
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated, token]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
        // Clear localStorage when loading from database
        localStorage.removeItem('cartItems');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToDatabase = async (items) => {
    if (!isAuthenticated || !token) return;

    try {
      await fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cartItems: items })
      });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (product) => {
    const newItems = (prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    };

    setCartItems((prevItems) => {
      const updated = newItems(prevItems);
      // Save to database if logged in
      if (isAuthenticated && token) {
        saveCartToDatabase(updated);
      }
      return updated;
    });
    
    // Show toast notification
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== productId);
      // Save to database if logged in
      if (isAuthenticated && token) {
        saveCartToDatabase(updated);
      }
      return updated;
    });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      // Save to database if logged in
      if (isAuthenticated && token) {
        saveCartToDatabase(updated);
      }
      return updated;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    // Clear from database if logged in
    if (isAuthenticated && token) {
      try {
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
    // Clear localStorage
    localStorage.removeItem('cartItems');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    toastMessage,
    showToast,
    hideToast,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

