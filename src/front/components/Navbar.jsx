import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const logout = () => {
        // Dispatch logout action - your reducer handles localStorage cleanup
        dispatch({ type: 'LOGOUT' });
        
        // Redirect to home
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light glassmorphism-navbar">
            <div className="container">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <span className="navbar-brand-text mb-0 h1">Invoice Manager</span>
                </Link>

                {/* Mobile toggle button */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation items */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link to="/" className="nav-link modern-nav-link">
                                <i className="fas fa-home me-1"></i>Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/demo" className="nav-link modern-nav-link">
                                <i className="fas fa-code me-1"></i>Demo
                            </Link>
                        </li>
                        {store.token && (
                            <li className="nav-item">
                                <Link to="/private" className="nav-link modern-nav-link">
                                    <i className="fas fa-file-invoice me-1"></i>My Invoices
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* Auth buttons */}
                    <div className="navbar-nav">
                        {!store.token ? (
                            <>
                                <Link to="/login" className="nav-link">
                                    <button className="btn btn-outline-primary modern-button me-2">
                                        <i className="fas fa-sign-in-alt me-1"></i>
                                        Login
                                    </button>
                                </Link>
                                <Link to="/signup" className="nav-link">
                                    <button className="btn btn-primary modern-button">
                                        <i className="fas fa-user-plus me-1"></i>
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="d-flex align-items-center">
                                <span className="navbar-text me-3 user-greeting">
                                    <i className="fas fa-user-circle me-1"></i>
                                    Welcome back!
                                </span>
                                <button 
                                    onClick={logout}
                                    className="btn btn-outline-danger modern-button logout-btn"
                                >
                                    <i className="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};