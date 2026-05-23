import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
      formData.phone || undefined
    );

    if (result.success) {
      navigate('/');
    } else {
      if (result.errors) {
        const fieldErrors = {};
        result.errors.forEach(err => {
          if (err.param) {
            fieldErrors[err.param] = err.msg;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: result.message });
      }
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>{language === 'sl' ? 'Ustvari Račun' : 'Create Account'}</h1>
            <p>{language === 'sl' ? 'Pridružite se Parfumerija CICKO danes' : 'Join Perfume Paradise today'}</p>
          </div>

          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{t('firstName')}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder={language === 'sl' ? 'Janez' : 'John'}
                  disabled={loading}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="field-error">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">{t('lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder={language === 'sl' ? 'Novak' : 'Doe'}
                  disabled={loading}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="field-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                disabled={loading}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">{language === 'sl' ? 'Telefon (Opcijsko)' : 'Phone (Optional)'}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+386 31 123 456"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder={language === 'sl' ? 'Najmanj 8 znakov' : 'At least 8 characters'}
                  disabled={loading}
                  className={errors.password ? 'error' : ''}
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
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
              <small className="password-hint">
                {language === 'sl' 
                  ? 'Mora vsebovati veliko začetnico, malo začetnico in številko'
                  : 'Must contain uppercase, lowercase, and number'
                }
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder={language === 'sl' ? 'Ponovno vnesite geslo' : 'Re-enter your password'}
                  disabled={loading}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading 
                ? (language === 'sl' ? 'Ustvarjanje Računa...' : 'Creating Account...')
                : (language === 'sl' ? 'Ustvari Račun' : 'Create Account')
              }
            </button>
          </form>

          <div className="register-footer">
            <p>
              {t('haveAccount')}{' '}
              <Link to="/login" className="link">
                {language === 'sl' ? 'Prijavite se tukaj' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

