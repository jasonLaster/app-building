import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import { signup, clearError } from '../slices/authSlice';
import './SignUpForm.css';

export default function SignUpForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearError());

    if (!validate()) return;

    dispatch(signup({ name: name.trim(), email: email.trim(), password }));
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit} data-testid="signup-form">
      <div className="signup-form-header">
        <h1 className="signup-form-title">Create your account</h1>
        <p className="signup-form-subtitle">Get started with LinearClone</p>
      </div>

      {error && (
        <div className="signup-form-error" data-testid="signup-error">
          {error}
        </div>
      )}

      <div className="signup-form-field">
        <label htmlFor="signup-name" className="signup-form-label">Name</label>
        <input
          id="signup-name"
          type="text"
          className={`signup-form-input ${validationErrors.name ? 'signup-form-input-error' : ''}`}
          placeholder="Your full name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          data-testid="signup-name-input"
          autoComplete="name"
        />
        {validationErrors.name && (
          <span className="signup-form-field-error" data-testid="signup-name-error">
            {validationErrors.name}
          </span>
        )}
      </div>

      <div className="signup-form-field">
        <label htmlFor="signup-email" className="signup-form-label">Email</label>
        <input
          id="signup-email"
          type="email"
          className={`signup-form-input ${validationErrors.email ? 'signup-form-input-error' : ''}`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationErrors.email) {
              setValidationErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          data-testid="signup-email-input"
          autoComplete="email"
        />
        {validationErrors.email && (
          <span className="signup-form-field-error" data-testid="signup-email-error">
            {validationErrors.email}
          </span>
        )}
      </div>

      <div className="signup-form-field">
        <label htmlFor="signup-password" className="signup-form-label">Password</label>
        <input
          id="signup-password"
          type="password"
          className={`signup-form-input ${validationErrors.password ? 'signup-form-input-error' : ''}`}
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (validationErrors.password) {
              setValidationErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          data-testid="signup-password-input"
          autoComplete="new-password"
        />
        {validationErrors.password && (
          <span className="signup-form-field-error" data-testid="signup-password-error">
            {validationErrors.password}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="signup-form-button"
        disabled={loading}
        data-testid="signup-submit-button"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="signup-form-footer">
        Already have an account?{' '}
        <Link to="/login" className="signup-form-link" data-testid="signup-login-link">
          Log in
        </Link>
      </p>
    </form>
  );
}
