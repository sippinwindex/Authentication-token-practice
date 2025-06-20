// src/front/pages/Private.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from './fetch.js';
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

    useEffect(() => {
        if (!store.token) {
            navigate("/login");
            return;
        }
        const fetchUserInvoices = async () => {
            setIsLoading(true);
            try {
                const data = await getInvoices(store.token);
                setInvoices(data.invoices || []);
                setError("");
            } catch (error) {
                setError(error.message);
                if (error.message.includes("401") || error.message.includes("422")) {
                    dispatch({ type: "LOGOUT" });
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInvoices();
    }, [store.token, navigate, dispatch]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const newInvoice = await createInvoice(store.token, { invoice_amount: newAmount, invoice_date: newDate });
            setInvoices([newInvoice, ...invoices]);
            setNewAmount("");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (invoiceId) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteInvoice(store.token, invoiceId);
                setInvoices(invoices.filter(inv => inv.id !== invoiceId));
            } catch (error) {
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
        try {
            const updatedInvoice = await updateInvoice(store.token, isEditing.id, { invoice_amount: editAmount, invoice_date: editDate });
            setInvoices(invoices.map(inv => inv.id === isEditing.id ? updatedInvoice : inv));
            setIsEditing(null);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <h1>Invoice Dashboard</h1>
            <div className="glass-panel">
                <h2>Create New Invoice</h2>
                <form onSubmit={handleCreate}>
                    <div className="form-grid">
                        <div className="form-group" style={{flexGrow: 1}}>
                            <label htmlFor="newAmount">Invoice Amount ($)</label>
                            <input type="number" step="0.01" className="form-input" id="newAmount" value={newAmount} onChange={e => setNewAmount(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{flexGrow: 1}}>
                            <label htmlFor="newDate">Invoice Date</label>
                            <input type="date" className="form-input" id="newDate" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Add Invoice</button>
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
                                <div className="form-group"><label htmlFor="editAmount">Invoice Amount ($)</label><input type="number" step="0.01" className="form-input" id="editAmount" value={editAmount} onChange={e => setEditAmount(e.target.value)} required /></div>
                                <div className="form-group" style={{marginTop: '1rem'}}><label htmlFor="editDate">Invoice Date</label><input type="date" className="form-input" id="editDate" value={editDate} onChange={e => setEditDate(e.target.value)} required /></div>
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