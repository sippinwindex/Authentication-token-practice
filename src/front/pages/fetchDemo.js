// src/front/pages/fetchDemo.js - Demo version that works without backend
import { mockDataService } from '../mockDataService.js';

// Check if we're in demo mode (no backend available)
const DEMO_MODE = !import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_DEMO_MODE === 'true';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

console.log(`🔧 Mode: ${DEMO_MODE ? 'DEMO (No Backend)' : 'LIVE Backend'}`);
console.log(`🔧 Backend URL: ${BACKEND_URL}`);

// Enhanced API fetch helper
const apiFetch = async (endpoint, options = {}) => {
    if (DEMO_MODE) {
        throw new Error('Backend not available - using demo mode');
    }

    try {
        console.log(`🌐 Making request to: ${BACKEND_URL}${endpoint}`);
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        console.log(`📡 Response status: ${response.status} for ${endpoint}`);

        if (response.status === 204) {
            return { success: true };
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ JSON parsing error:', jsonError);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return { success: true };
        }

        if (!response.ok) {
            console.error(`❌ API Error ${response.status}:`, data);
            
            if (response.status === 401) {
                throw new Error('Unauthorized - Please log in again');
            }
            if (response.status === 403) {
                throw new Error('Forbidden - Access denied');
            }
            if (response.status === 422) {
                throw new Error('Invalid token - Please log in again');
            }
            if (response.status === 409) {
                throw new Error(data.message || 'Conflict - Resource already exists');
            }
            if (response.status === 404) {
                throw new Error(data.message || 'Resource not found');
            }
            
            throw new Error(data.message || `API error: ${response.status}`);
        }
        
        console.log('✅ Request successful:', endpoint);
        return data;
        
    } catch (error) {
        console.error(`❌ Request failed for ${endpoint}:`, error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error - Using demo mode instead');
        }
        throw error;
    }
};

// Login function with fallback to demo
export const loginUser = async (email, password) => {
    try {
        console.log('🔑 Attempting login...');
        
        if (DEMO_MODE) {
            console.log('🎭 Using demo login');
            return await mockDataService.mockLogin(email, password);
        }

        const data = await apiFetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('✅ Login successful:', data);
        return {
            ...data,
            token: data.token || data.access_token
        };
    } catch (error) {
        console.log('🎭 Falling back to demo login');
        return await mockDataService.mockLogin(email, password);
    }
};

export const registerUser = async (email, password) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo registration');
            return await mockDataService.mockRegister(email, password);
        }

        const data = await apiFetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('✅ Registration successful:', data);
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo registration');
        return await mockDataService.mockRegister(email, password);
    }
};

export const getInvoices = async (token) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo invoices');
            return await mockDataService.mockGetInvoices();
        }

        const data = await apiFetch('/api/invoices', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoices fetched:', data);
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo invoices');
        return await mockDataService.mockGetInvoices();
    }
};

export const getInvoice = async (token, invoiceId) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo invoice');
            return await mockDataService.mockGetInvoice(invoiceId);
        }

        const data = await apiFetch(`/api/invoices/${invoiceId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoice fetched:', data);
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo invoice');
        return await mockDataService.mockGetInvoice(invoiceId);
    }
};

export const createInvoice = async (token, invoiceData) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo create invoice');
            return await mockDataService.mockCreateInvoice(invoiceData);
        }

        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoiceNumber = `INV-${timestamp}-${random}`;
        
        const data = await apiFetch('/api/invoices', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                invoice_number: invoiceNumber,
                invoice_amount: parseFloat(invoiceData.invoice_amount),
                invoice_date: invoiceData.invoice_date
            })
        });
        
        console.log('✅ Invoice created:', data);
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo create invoice');
        return await mockDataService.mockCreateInvoice(invoiceData);
    }
};

export const updateInvoice = async (token, invoiceId, invoiceData) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo update invoice');
            return await mockDataService.mockUpdateInvoice(invoiceId, invoiceData);
        }

        const data = await apiFetch(`/api/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                invoice_amount: parseFloat(invoiceData.invoice_amount),
                invoice_date: invoiceData.invoice_date
            })
        });
        
        console.log('✅ Invoice updated:', data);
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo update invoice');
        return await mockDataService.mockUpdateInvoice(invoiceId, invoiceData);
    }
};

export const deleteInvoice = async (token, invoiceId) => {
    try {
        if (DEMO_MODE) {
            console.log('🎭 Using demo delete invoice');
            return await mockDataService.mockDeleteInvoice(invoiceId);
        }

        const data = await apiFetch(`/api/invoices/${invoiceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoice deleted');
        return data;
    } catch (error) {
        console.log('🎭 Falling back to demo delete invoice');
        return await mockDataService.mockDeleteInvoice(invoiceId);
    }
};

// Token management utilities
export const isAuthenticated = () => {
    if (DEMO_MODE) return !!localStorage.getItem('demo_token');
    const token = localStorage.getItem('token');
    return !!token;
};

export const getStoredToken = () => {
    if (DEMO_MODE) return localStorage.getItem('demo_token');
    return localStorage.getItem('token');
};

export const setStoredToken = (token) => {
    if (DEMO_MODE) {
        localStorage.setItem('demo_token', token);
        console.log('💾 Demo token stored successfully');
    } else {
        localStorage.setItem('token', token);
        console.log('💾 Token stored successfully');
    }
};

export const removeStoredToken = () => {
    if (DEMO_MODE) {
        localStorage.removeItem('demo_token');
        console.log('🗑️ Demo token removed');
    } else {
        localStorage.removeItem('token');
        console.log('🗑️ Token removed');
    }
};

export const logoutUser = () => {
    removeStoredToken();
    localStorage.removeItem('user');
    console.log('👋 User logged out');
    return Promise.resolve({ message: 'Logged out successfully' });
};

// Debug function
export const debugTokenStatus = () => {
    const token = getStoredToken();
    const isAuth = isAuthenticated();
    const status = {
        mode: DEMO_MODE ? 'DEMO' : 'LIVE',
        token: token ? 'EXISTS' : 'MISSING',
        isAuthenticated: isAuth,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
    };
    
    console.log('🔍 Debug Token Status:', status);
    return status;
};