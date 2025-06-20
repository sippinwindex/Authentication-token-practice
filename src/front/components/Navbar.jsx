// src/front/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <nav className="main-nav">
            <Link to={store.token ? "/private" : "/"} className="nav-logo">
                InvoiceApp
            </Link>
            <ul className="nav-links">
                {!store.token ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">
                            {/* Render as a button for more prominence */}
                            <button className="btn btn-primary" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>Sign Up</button>
                        </Link></li>
                    </>
                ) : (
                    <>
                        {store.user && <li style={{color: 'var(--text-color-muted)'}}>Hi, {store.user.email}</li>}
                        <li><button onClick={handleLogout} className="btn" style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>Logout</button></li>
                    </>
                )}
            </ul>
        </nav>
    );
};