// src/front/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';
import { loginUser } from './fetch.js'; // <-- IMPORT from fetch.js

export const Login = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This effect correctly redirects if the user is already logged in.
  useEffect(() => {
    if (store.token) {
      navigate('/private');
    }
  }, [store.token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Call the clean, centralized function from fetch.js
      const data = await loginUser(email, password);
      
      // 2. Dispatch the success action to the reducer
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: data.token, user: data.user },
      });
      
      // 3. Navigate to the private dashboard
      navigate('/private');

    } catch (err) {
      // 4. On failure, set the local error state to display it
      setError(err.message);
      // Optionally, you can also dispatch to a global error state if needed
      // dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use the custom CSS classes for styling
    <div className="glass-panel" style={{ maxWidth: '500px' }}>
      <h1>Login</h1>
      
      {/* Use the custom error message style */}
      {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--text-color-accent)' }}>Sign Up</Link>
      </p>
    </div>
  );
};