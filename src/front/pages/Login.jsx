// src/front/pages/Login.jsx - DEBUG VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';
import { loginUser, setStoredToken, isAuthenticated, debugTokenStatus } from './fetchDemo.js';

export const Login = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (store.token || isAuthenticated()) {
      navigate('/private');
    }
  }, [store.token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setDebugInfo('Starting login process...');

    try {
      console.log('🔐 Starting login process...');
      setDebugInfo('Calling loginUser API...');

      // Step 1: Call login API
      const data = await loginUser(email, password);
      console.log('📡 Login API response:', data);
      setDebugInfo(`Login API successful. Response: ${JSON.stringify(data, null, 2)}`);

      // Step 2: Extract token
      const token = data.token || data.access_token;
      console.log('🔑 Extracted token:', token ? `${token.substring(0, 30)}...` : 'NONE');
      setDebugInfo(prev => prev + `\nToken extracted: ${token ? 'YES' : 'NO'}`);

      if (!token) {
        throw new Error('No authentication token received from server');
      }

      // Step 3: Store token
      setStoredToken(token);
      console.log('💾 Token stored in localStorage');
      setDebugInfo(prev => prev + '\nToken stored in localStorage');

      // Step 4: Test the token immediately
      setDebugInfo(prev => prev + '\nTesting token...');
      try {
        const testResult = await testAuth(token);
        console.log('✅ Token test successful:', testResult);
        setDebugInfo(prev => prev + `\nToken test: SUCCESS - ${JSON.stringify(testResult)}`);
      } catch (testError) {
        console.error('❌ Token test failed:', testError);
        setDebugInfo(prev => prev + `\nToken test: FAILED - ${testError.message}`);
        throw new Error(`Token validation failed: ${testError.message}`);
      }

      // Step 5: Update global state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: token,
          user: data.user || { email }
        },
      });
      console.log('🔄 Global state updated');
      setDebugInfo(prev => prev + '\nGlobal state updated');

      // Step 6: Navigate
      setDebugInfo(prev => prev + '\nNavigating to private page...');
      navigate('/private');

    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(`Login failed: ${err.message}`);
      setDebugInfo(prev => prev + `\nERROR: ${err.message}`);

      // Clear any stored data on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to check current state
  const runDebugCheck = () => {
    const status = debugTokenStatus();
    setDebugInfo(`Current Debug Status:\n${JSON.stringify(status, null, 2)}`);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px' }}>
      <h1>Login</h1>

      {/* Debug Panel - only show in development */}
      {import.meta.env.DEV && (
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          fontSize: '12px',
          border: '1px solid #dee2e6'
        }}>
          <strong>Debug Info:</strong>
          <button
            onClick={runDebugCheck}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              fontSize: '11px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Check Status
          </button>
          <pre style={{
            marginTop: '10px',
            whiteSpace: 'pre-wrap',
            fontSize: '11px',
            background: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {debugInfo || 'No debug info yet'}
          </pre>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

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
            autoComplete="email"
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
            autoComplete="current-password"
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
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--text-color-accent)' }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
};