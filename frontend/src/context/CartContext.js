import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartFromDatabase();
    } else {
      const saved = localStorage.getItem('cartItems');
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
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
      await fetch(`${API_URL}/api/cart/sync`, {
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
      if (isAuthenticated && token) {
        saveCartToDatabase(updated);
      }
      return updated;
    });

    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  const removeFromCart = async (productId) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== productId);
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
      if (isAuthenticated && token) {
        saveCartToDatabase(updated);
      }
      return updated;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    if (isAuthenticated && token) {
      try {
        await fetch(`${API_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
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
