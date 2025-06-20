// src/front/pages/Private.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, getStoredToken, isAuthenticated } from './fetch.js';
import './private.css';

export const Private = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditing, setIsEditing] = useState(null);
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");

    // Get the token from either store or localStorage
    const getToken = () => {
        return store.token || getStoredToken();
    };

    useEffect(() => {
        const token = getToken();
        
        // If no token exists anywhere, redirect to login
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchUserInvoices = async () => {
            setIsLoading(true);
            setError(""); // Clear any previous errors
            try {
                const data = await getInvoices(token);
                setInvoices(data.invoices || []);
            } catch (error) {
                console.error("Error fetching invoices:", error);
                setError(error.message);
                
                // If authentication error, logout and redirect
                if (error.message.includes("401") || error.message.includes("422") || error.message.includes("Unauthorized")) {
                    dispatch({ type: "LOGOUT" });
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInvoices();
    }, []); // Empty dependency array to prevent infinite loop

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

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const newInvoice = await createInvoice(token, { 
                invoice_amount: newAmount, 
                invoice_date: newDate 
            });
            setInvoices([newInvoice, ...invoices]);
            setNewAmount("");
            setNewDate(new Date().toISOString().split('T')[0]); // Reset date
        } catch (error) {
            console.error("Error creating invoice:", error);
            setError(error.message);
            
            // Handle auth errors
            if (error.message.includes("401") || error.message.includes("422") || error.message.includes("Unauthorized")) {
                dispatch({ type: "LOGOUT" });
                navigate("/login");
            }
        }
    };

    const handleDelete = async (invoiceId) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            const token = getToken();
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                await deleteInvoice(token, invoiceId);
                setInvoices(invoices.filter(inv => inv.id !== invoiceId));
                setError(""); // Clear any previous errors
            } catch (error) {
                console.error("Error deleting invoice:", error);
                setError(error.message);
            }
        }
    };

    const handleEditClick = (invoice) => {
        setIsEditing(invoice);
        setEditAmount(invoice.invoice_amount);
        setEditDate(invoice.invoice_date);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        
        const token = getToken();
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const updatedInvoice = await updateInvoice(token, isEditing.id, { 
                invoice_amount: editAmount, 
                invoice_date: editDate 
            });
            setInvoices(invoices.map(inv => inv.id === isEditing.id ? updatedInvoice : inv));
            setIsEditing(null);
        } catch (error) {
            console.error("Error updating invoice:", error);
            setError(error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Invoice Dashboard</h1>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', fontSize: '12px' }}>
                    Debug: Token exists: {!!getToken()}, Store token: {!!store.token}, LocalStorage token: {!!getStoredToken()}
                </div>
            )}
            
            <div className="glass-panel">
                <h2>Create New Invoice</h2>
                <form onSubmit={handleCreate}>
                    <div className="form-grid">
                        <div className="form-group" style={{flexGrow: 1}}>
                            <label htmlFor="newAmount">Invoice Amount ($)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="form-input" 
                                id="newAmount" 
                                value={newAmount} 
                                onChange={e => setNewAmount(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group" style={{flexGrow: 1}}>
                            <label htmlFor="newDate">Invoice Date</label>
                            <input 
                                type="date" 
                                className="form-input" 
                                id="newDate" 
                                value={newDate} 
                                onChange={e => setNewDate(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                        Add Invoice
                    </button>
                </form>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="glass-panel">
                <h2>Your Invoices</h2>
                {isLoading ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : invoices.length > 0 ? (
                    <div className="invoice-list">
                        {invoices.map(invoice => (
                            <Link to={`/invoice/${invoice.id}`} key={invoice.id} className="invoice-item" style={{textDecoration: 'none'}}>
                                <div className="invoice-details">
                                    <h3>{invoice.invoice_number}</h3>
                                    <p>Amount: <strong>${parseFloat(invoice.invoice_amount).toFixed(2)}</strong> | Date: {invoice.invoice_date}</p>
                                </div>
                                <div className="invoice-actions">
                                    <button onClick={(e) => { e.preventDefault(); handleEditClick(invoice); }}>Edit</button>
                                    <button onClick={(e) => { e.preventDefault(); handleDelete(invoice.id); }}>Delete</button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>You have no invoices yet. Add one above!</p>
                )}
            </div>
            
            {isEditing && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <div className="glass-panel">
                            <h2>Edit Invoice {isEditing.invoice_number}</h2>
                            <form onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label htmlFor="editAmount">Invoice Amount ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        className="form-input" 
                                        id="editAmount" 
                                        value={editAmount} 
                                        onChange={e => setEditAmount(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group" style={{marginTop: '1rem'}}>
                                    <label htmlFor="editDate">Invoice Date</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        id="editDate" 
                                        value={editDate} 
                                        onChange={e => setEditDate(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};