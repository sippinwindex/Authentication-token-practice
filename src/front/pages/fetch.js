// src/front/pages/fetch.js - FINAL FIXED VERSION

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

console.log('🔧 Backend URL:', BACKEND_URL);

// Enhanced API fetch helper with comprehensive error handling
const apiFetch = async (endpoint, options = {}) => {
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

        // Handle successful DELETE requests (204 No Content)
        if (response.status === 204) {
            return { success: true };
        }

        // Try to parse JSON response
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
            
            // Handle different error scenarios with specific messages
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
            throw new Error('Network error - Please check your connection and backend URL');
        }
        throw error;
    }
};

// Test backend connection
export const testConnection = async () => {
    try {
        const data = await apiFetch('/api/test');
        console.log('✅ Backend connection test successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Backend connection test failed:', error);
        throw error;
    }
};

// FIXED: Login function with better error handling
export const loginUser = async (email, password) => {
    try {
        console.log('🔑 Attempting login for:', email);
        
        const data = await apiFetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('✅ Login successful:', data);
        
        // Ensure we always have a 'token' field for the frontend
        const token = data.token || data.access_token;
        
        if (!token) {
            throw new Error('No authentication token received from server');
        }
        
        return {
            ...data,
            token: token
        };
    } catch (error) {
        console.error('❌ Login failed:', error);
        throw error;
    }
};

export const registerUser = async (email, password) => {
    try {
        console.log('📝 Attempting registration for:', email);
        
        const data = await apiFetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        console.log('✅ Registration successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Registration failed:', error);
        throw error;
    }
};

export const getInvoices = async (token) => {
    try {
        console.log('📋 Fetching invoices...');
        
        const data = await apiFetch('/api/invoices', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoices fetched:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch invoices:', error);
        throw error;
    }
};

export const getInvoice = async (token, invoiceId) => {
    try {
        console.log('📄 Fetching invoice:', invoiceId);
        
        const data = await apiFetch(`/api/invoices/${invoiceId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoice fetched:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch invoice:', error);
        throw error;
    }
};

// FIXED: Better invoice number generation with more uniqueness
export const createInvoice = async (token, invoiceData) => {
    try {
        console.log('📝 Creating invoice with data:', invoiceData);
        
        // Generate a more unique invoice number
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
        console.error('❌ Failed to create invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (token, invoiceId, invoiceData) => {
    try {
        console.log('📝 Updating invoice:', invoiceId, invoiceData);
        
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
        console.error('❌ Failed to update invoice:', error);
        throw error;
    }
};

export const deleteInvoice = async (token, invoiceId) => {
    try {
        console.log('🗑️ Deleting invoice:', invoiceId);
        
        const data = await apiFetch(`/api/invoices/${invoiceId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Invoice deleted');
        return data;
    } catch (error) {
        console.error('❌ Failed to delete invoice:', error);
        throw error;
    }
};

// Token management utilities
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const getStoredToken = () => {
    return localStorage.getItem('token');
};

export const setStoredToken = (token) => {
    localStorage.setItem('token', token);
    console.log('💾 Token stored successfully');
};

export const removeStoredToken = () => {
    localStorage.removeItem('token');
    console.log('🗑️ Token removed');
};

export const logoutUser = () => {
    removeStoredToken();
    localStorage.removeItem('user');
    console.log('👋 User logged out');
    return Promise.resolve({ message: 'Logged out successfully' });
};

// Debug function for troubleshooting
export const debugTokenStatus = () => {
    const token = getStoredToken();
    const isAuth = isAuthenticated();
    const status = {
        token: token ? 'EXISTS' : 'MISSING',
        isAuthenticated: isAuth,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
    };
    
    console.log('🔍 Debug Token Status:', status);
    return status;
};

// Test authentication
export const testAuth = async (token) => {
    try {
        const data = await apiFetch('/api/test-auth', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Auth test successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Auth test failed:', error);
        throw error;
    }
};

// Debug token on backend
export const debugTokenOnBackend = async (token) => {
    try {
        const data = await apiFetch('/api/debug/test-token', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
        console.log('🔍 Backend token debug:', data);
        return data;
    } catch (error) {
        console.error('❌ Backend token debug failed:', error);
        throw error;
    }
};

// Test the token manually without @jwt_required decorator
export const testTokenManually = async (token) => {
    try {
        const data = await debugTokenOnBackend(token);
        console.log('🔍 Manual token test result:', data);
        return data;
    } catch (error) {
        console.error('❌ Manual token test failed:', error);
        throw error;
    }
};