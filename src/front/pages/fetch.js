// src/front/pages/fetch.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

// Helper for making authenticated requests
const apiFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.msg || `API error: ${response.status}`);
    }
    return data;
};

export const loginUser = async (email, password) => {
    return apiFetch('/api/token', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// Get all invoices for the logged-in user
export const getInvoices = async (token) => {
    const data = await apiFetch('/api/invoices', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    // Wrap in object to match Private.jsx expectation
    return { invoices: data };
};

// Create a new invoice
export const createInvoice = async (token, invoiceData) => {
    // Generate a unique invoice number if not provided
    const invoiceNumber = invoiceData.invoice_number || 
        `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    return apiFetch('/api/invoices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            invoice_number: invoiceNumber,
            invoice_amount: parseFloat(invoiceData.invoice_amount),
            invoice_date: invoiceData.invoice_date
        })
    });
};

// Update an existing invoice
export const updateInvoice = async (token, invoiceId, invoiceData) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            invoice_amount: parseFloat(invoiceData.invoice_amount),
            invoice_date: invoiceData.invoice_date
        })
    });
};

// Delete an invoice
export const deleteInvoice = async (token, invoiceId) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

// Get a single invoice by ID
export const getInvoice = async (token, invoiceId) => {
    try {
        // Since your backend doesn't have a single invoice endpoint,
        // we'll get all invoices and filter for the specific one
        const { invoices } = await getInvoices(token);
        const invoice = invoices.find(inv => inv.id === parseInt(invoiceId));
        
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        
        return invoice;
    } catch (error) {
        console.error('Error fetching single invoice:', error);
        throw error;
    }
};

// Register a new user
export const registerUser = async (email, password) => {
    return apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// Sign out function (if needed)
export const signOut = async () => {
    // Clear any stored tokens or user data
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    // You can add additional cleanup here if needed
    return { message: 'Logged out successfully' };
};