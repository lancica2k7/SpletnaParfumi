import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{language === 'sl' ? 'Dobrodošli Nazaj' : 'Welcome Back'}</h1>
            <p>{language === 'sl' ? 'Prijavite se v svoj račun' : 'Sign in to your account'}</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={language === 'sl' ? 'Vnesite geslo' : 'Enter your password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading 
                ? (language === 'sl' ? 'Prijavljanje...' : 'Signing in...') 
                : t('signIn')
              }
            </button>
          </form>

          <div className="login-footer">
            <p>
              {t('noAccount')}{' '}
              <Link to="/register" className="link">
                {language === 'sl' ? 'Registrirajte se tukaj' : 'Sign up here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

