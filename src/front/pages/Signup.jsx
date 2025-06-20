// src/front/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';
import { registerUser } from './fetch.js'; // <-- IMPORT from fetch.js

export const Signup = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Call the correct function from fetch.js
      const data = await registerUser(email, password);

      // 2. Dispatch the success action
      dispatch({
        type: 'SIGNUP_SUCCESS',
        payload: { message: data.message },
      });

      // 3. Redirect to the login page so the user can sign in
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '500px' }}>
      <h1>Create Account</h1>
      
      {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
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
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--text-color-accent)' }}>Log In</Link>
      </p>
    </div>
  );
};