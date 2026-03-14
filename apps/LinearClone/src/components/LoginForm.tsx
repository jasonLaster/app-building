import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { login, clearError } from '../slices/authSlice';
import './LoginForm.css';

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearError());

    if (!validate()) return;

    dispatch(login({ email: email.trim(), password }));
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} data-testid="login-form">
      <div className="login-form-header">
        <h1 className="login-form-title">Sign in to LinearClone</h1>
        <p className="login-form-subtitle">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="login-form-error" data-testid="login-error">
          {error}
        </div>
      )}

      <div className="login-form-field">
        <label htmlFor="login-email" className="login-form-label">Email</label>
        <input
          id="login-email"
          type="email"
          className={`login-form-input ${validationErrors.email ? 'login-form-input-error' : ''}`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationErrors.email) {
              setValidationErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          data-testid="login-email-input"
          autoComplete="email"
        />
        {validationErrors.email && (
          <span className="login-form-field-error" data-testid="login-email-error">
            {validationErrors.email}
          </span>
        )}
      </div>

      <div className="login-form-field">
        <label htmlFor="login-password" className="login-form-label">Password</label>
        <input
          id="login-password"
          type="password"
          className={`login-form-input ${validationErrors.password ? 'login-form-input-error' : ''}`}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationErrors.password) {
              setValidationErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          data-testid="login-password-input"
          autoComplete="current-password"
        />
        {validationErrors.password && (
          <span className="login-form-field-error" data-testid="login-password-error">
            {validationErrors.password}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="login-form-button"
        disabled={loading}
        data-testid="login-submit-button"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="login-form-footer">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="login-form-link" data-testid="login-signup-link">
          Sign up
        </Link>
      </p>
    </form>
  );
}
