/**
 * Authentication Form Component
 * Uses authentication hook with service call chains
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      await login({
        username: formData.username,
        password: formData.password
      });
    } else {
      await register(formData);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={formData.username}
            onChange={handleChange('username')}
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </div>
        )}

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
};

export default AuthForm;