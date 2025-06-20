// src/front/pages/Single.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getInvoice, getStoredToken } from './fetch.js';
import './private.css'; // Uses the same styles

export const Single = () => {
  const { store, dispatch } = useGlobalReducer();
  const { theId } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the token from either store or localStorage
  const getToken = () => {
    return store.token || getStoredToken();
  };

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSingleInvoice = async () => {
      setIsLoading(true);
      setError(""); // Clear any previous errors
      
      try {
        const invoiceData = await getInvoice(token, theId);
        setInvoice(invoiceData);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError(err.message);
        
        // Handle auth errors
        if (err.message.includes("401") || err.message.includes("422") || err.message.includes("Unauthorized")) {
          dispatch({ type: "LOGOUT" });
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleInvoice();
  }, [theId, navigate, dispatch]); // Removed store.token from dependencies to prevent infinite loop

  // Sync token from localStorage to store if missing
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken && !store.token) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: storedToken, user: store.user }
      });
    }
  }, [store.token, dispatch]);

  if (isLoading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (error) {
    return (
        <div className="glass-panel" style={{maxWidth: '600px', textAlign: 'center'}}>
            <h2 style={{color: '#dc3545'}}>Error</h2>
            <p className="error-message">{error}</p>
            <Link to="/private" className="btn btn-primary">Back to Dashboard</Link>
        </div>
    );
  }
   
  if (!invoice) {
      return (
          <div className="glass-panel" style={{maxWidth: '600px', textAlign: 'center'}}>
            <h2>Invoice Not Found</h2>
            <p>Could not find the invoice you're looking for.</p>
            <Link to="/private" className="btn btn-primary">Back to Dashboard</Link>
          </div>
      )
  }

  return (
    <div className="dashboard-container">
        <h1>Invoice Details</h1>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', fontSize: '12px' }}>
                Debug: Token exists: {!!getToken()}, Invoice ID: {theId}
            </div>
        )}
        
        <div className="glass-panel">
            <h2>{invoice.invoice_number}</h2>
            <div className="invoice-detail-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem'}}>
                <div>
                    <p style={{textAlign: 'left', margin: 0, color: 'var(--text-color-muted)'}}>Amount</p>
                    <p style={{textAlign: 'left', margin: 0, fontSize: '2rem', fontWeight: '600', color: 'var(--text-color-heading)'}}>
                        ${parseFloat(invoice.invoice_amount).toFixed(2)}
                    </p>
                </div>
                <div>
                    <p style={{textAlign: 'left', margin: 0, color: 'var(--text-color-muted)'}}>Invoice Date</p>
                    <p style={{textAlign: 'left', margin: 0, fontSize: '1.2rem'}}>
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                    </p>
                </div>
                 
                <div>
                    <p style={{textAlign: 'left', margin: 0, color: 'var(--text-color-muted)'}}>Created</p>
                    <p style={{textAlign: 'left', margin: 0, fontSize: '1.2rem'}}>
                        {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : 'N/A'}
                    </p>
                </div>
                 
                <div>
                    <p style={{textAlign: 'left', margin: 0, color: 'var(--text-color-muted)'}}>Last Updated</p>
                    <p style={{textAlign: 'left', margin: 0, fontSize: '1.2rem'}}>
                        {invoice.updated_at ? new Date(invoice.updated_at).toLocaleString() : 'N/A'}
                    </p>
                </div>
            </div>
            <div style={{borderTop: '1px solid var(--glass-border-color)', marginTop: '2rem', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}>
                 <Link to="/private" className="btn btn-primary">Back to Dashboard</Link>
            </div>
        </div>
    </div>
  );
};