// src/front/pages/fetch.js

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

// This helper function is perfect and needs no changes.
const apiFetch = async (endpoint, options = {}) => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 204) {
        return { success: true };
    }

    const data = await response.json();
    if (!response.ok) {
        // Your backend now sends "message" for errors, so this is correct.
        throw new Error(data.message || `API error: ${response.status}`);
    }
    return data;
};

// This function is correct. It calls /api/login as required by the backend.
export const loginUser = (email, password) => {
    return apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// This function is correct.
export const registerUser = (email, password) => {
    return apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// This function is correct. The backend now returns {"invoices": [...]}.
export const getInvoices = (token) => {
    return apiFetch('/api/invoices', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

// =================================================================
//          THIS IS THE FULLY SYNCHRONIZED VERSION
// =================================================================

export const getInvoice = (token, invoiceId) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};
// =================================================================

// This function is correct. It generates the invoice number on the frontend.
export const createInvoice = (token, invoiceData) => {
    const invoiceNumber = `INV-${Date.now()}`;
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

// This function is correct.
export const updateInvoice = (token, invoiceId, invoiceData) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            invoice_amount: parseFloat(invoiceData.invoice_amount),
            invoice_date: invoiceData.invoice_date
        })
    });
};

// This function is correct.
export const deleteInvoice = (token, invoiceId) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};