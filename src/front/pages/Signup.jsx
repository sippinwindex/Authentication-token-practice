// src/front/pages/Signup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer'; // Default import

export const Signup = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  // Navigate to /login on successful signup
  useEffect(() => {
    if (store.isSignUpSuccessful) {
      navigate('/login');
    }
  }, [store.isSignUpSuccessful, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed. Please try again.');
      }
      const data = await response.json();
      dispatch({
        type: 'SIGNUP_SUCCESS',
        payload: { message: 'Signup successful! Please log in.', isSignUpSuccessful: true },
      });
    } catch (err) {
      setError(err.message);
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container text-center">
        <div className="glassmorphism-card">
          <h1 className="mb-4">Sign Up</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          {store.message && <p>{store.message}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingEmail">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 modern-button">
              Sign Up
            </button>
          </form>
          <p className="mt-3">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};