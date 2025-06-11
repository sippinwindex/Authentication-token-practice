// src/front/pages/Login.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { loginUser } from "./fetch";
import "./login.css";

export const Login = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (store.token && store.token !== "" && store.token !== null) {
            navigate("/private");
        }
    }, [store.token, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }

        try {
            const data = await loginUser(email, password);
            
            dispatch({
                type: "LOGIN_SUCCESS",
                payload: { token: data.access_token, user: data.user },
            });
            navigate("/private");

        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    // ### FIX ###: This section was missing its content in the previous response.
    // It now includes the full JSX for both the logged-in view and the login form.
    if (store.token && store.token !== "" && store.token !== null) {
        return (
            <div className="login-page-wrapper">
                <div className="login-container text-center mt-5">
                    <div className="glassmorphism-card p-4">
                        <h2>Welcome Back!</h2>
                        <p>Hello {store.user?.email || 'User'}, you are logged in!</p>
                        <Link to="/private" className="btn btn-primary modern-button mt-3">
                            Go to Dashboard
                        </Link>
                        <button
                            onClick={() => {
                                dispatch({ type: "LOGOUT" });
                                navigate("/login");
                            }}
                            className="btn btn-outline-secondary modern-button mt-3 ms-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page-wrapper">
            <div className="login-container text-center">
                <div className="glassmorphism-card">
                    <h1 className="mb-4">Login</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <label htmlFor="floatingInput">Email address</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="password"
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 modern-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>
                    <p className="mt-3">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

//useState("");
// useEffect(() => {
// if(store.isLoginSuccesful) {
//  navigate('/private')
// }
//}, [store.isLoginSuccesful])
