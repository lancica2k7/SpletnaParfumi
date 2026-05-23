import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import './App.css';

const AppContent = () => {
  const { toastMessage, showToast, hideToast } = useCart();
  
  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
      <Toast message={toastMessage} isVisible={showToast} onClose={hideToast} />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Admin routes - separate layout without Header/Footer */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              
              {/* Main app routes - with Header/Footer */}
              <Route path="/*" element={
                <div className="App">
                  <AppContent />
                </div>
              } />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
