// src/front/pages/Private.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from './fetch';
import './login.css'; // Re-use some styles
import './private.css'; // Add new specific styles

export const Private = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    // State for data, loading, and errors
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // State for the "Create New Invoice" form
    const [newAmount, setNewAmount] = useState("");
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]); // Defaults to today

    // State for the "Edit Invoice" modal
    const [isEditing, setIsEditing] = useState(null); // Will hold the invoice object being edited
    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");

    // Fetch invoices when the component loads
    useEffect(() => {
        if (!store.token) {
            navigate("/login");
            return;
        }
        
        const fetchUserInvoices = async () => {
            setIsLoading(true);
            try {
                const data = await getInvoices(store.token);
                setInvoices(data.invoices);
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
        if (!newAmount) {
            setError("Amount is required.");
            return;
        }

        try {
            const newInvoice = await createInvoice(store.token, {
                invoice_amount: newAmount,
                invoice_date: newDate
            });
            setInvoices([newInvoice, ...invoices]); // Add to top of the list
            setNewAmount(""); // Reset form
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (invoiceId) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
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
            const updatedInvoice = await updateInvoice(store.token, isEditing.id, {
                invoice_amount: editAmount,
                invoice_date: editDate
            });
            setInvoices(invoices.map(inv => inv.id === isEditing.id ? updatedInvoice : inv));
            setIsEditing(null); // Close the modal
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <h1 className="text-center mb-4 text-dark">Invoice Dashboard</h1>
                
                {/* Create Invoice Form */}
                <div className="glassmorphism-card form-card">
                    <h2 className="text-center mb-3">Create New Invoice</h2>
                    <form onSubmit={handleCreate}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-floating mb-3">
                                    <input type="number" step="0.01" className="form-control" id="newAmount" placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} required />
                                    <label htmlFor="newAmount">Invoice Amount ($)</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating mb-3">
                                    <input type="date" className="form-control" id="newDate" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                                    <label htmlFor="newDate">Invoice Date</label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary modern-button w-100">Add Invoice</button>
                    </form>
                </div>
                
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Invoices List */}
                <h2 className="text-center my-4 text-dark">Your Invoices</h2>
                {isLoading ? (
                    <div className="text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
                ) : invoices.length > 0 ? (
                    <div>
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="invoice-card">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5>{invoice.invoice_number}</h5>
                                        <p className="invoice-details mb-0">
                                            Amount: <strong>${parseFloat(invoice.invoice_amount).toFixed(2)}</strong> | Date: {invoice.invoice_date}
                                        </p>
                                    </div>
                                    <div className="invoice-actions">
                                        <button onClick={() => handleEditClick(invoice)} className="btn btn-sm btn-outline-primary">Edit</button>
                                        <button onClick={() => handleDelete(invoice.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center alert alert-secondary">You have no invoices yet. Add one above!</div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="edit-modal">
                    <div className="edit-modal-content">
                        <div className="glassmorphism-card">
                            <h2 className="text-center">Edit Invoice {isEditing.invoice_number}</h2>
                            <form onSubmit={handleUpdate}>
                                <div className="form-floating mb-3">
                                    <input type="number" step="0.01" className="form-control" id="editAmount" placeholder="Amount" value={editAmount} onChange={e => setEditAmount(e.target.value)} required />
                                    <label htmlFor="editAmount">Invoice Amount ($)</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="date" className="form-control" id="editDate" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                                    <label htmlFor="editDate">Invoice Date</label>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button type="button" onClick={() => setIsEditing(null)} className="btn btn-secondary modern-button me-2">Cancel</button>
                                    <button type="submit" className="btn btn-primary modern-button">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};