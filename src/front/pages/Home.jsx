// src/front/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// This is a NAMED EXPORT. The "export" keyword is right here.
export const Home = () => {
    return (
        // This uses the custom CSS class from layout.css for consistent styling.
        <div className="glass-panel" style={{ maxWidth: '700px', textAlign: 'center' }}>
            <h1>Welcome to InvoiceApp</h1>
            <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                A modern, clean, and fast application to manage your invoices. 
                Log in to view your dashboard or sign up to get started.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Link to="/login" className="btn btn-primary">
                    Login
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                    Sign Up
                </Link>
            </div>
        </div>
    );
};