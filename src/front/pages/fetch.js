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

// ### NEW ###: Get all invoices for the logged-in user
export const getInvoices = async (token) => {
    return apiFetch('/api/invoices', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

// ### NEW ###: Create a new invoice
export const createInvoice = async (token, invoiceData) => {
    return apiFetch('/api/invoices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(invoiceData)
    });
};

// ### NEW ###: Update an existing invoice
export const updateInvoice = async (token, invoiceId, invoiceData) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(invoiceData)
    });
};

// ### NEW ###: Delete an invoice
export const deleteInvoice = async (token, invoiceId) => {
    return apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};


// const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/token`, options);
// handle any non-200 error codes 
// if (!response.ok) {
// const data = await response.json();
// console.log(data.message);
// return {
// error: {
//      status: response.status,
//      statusTest: response.statusText,
//  }
// }
//}

// if the response is a 200
// const data = await response.json();
// console.log(data);
// sessionStorage.setItem('token', data.acces_token);
// dispatch({
//  type: 'fetched token',})
//  payload: {
//   message: data.message,
//   token: data.access_token,
//   isLoginSuccesful: true,
//  }
//});
// return data;
//};
// export const signOut = async ()


// case 'loggedOut':
//{
// const {message, token, isLoginSuccesful} = action.payload;
// sessionStorage.removeItem('token');
// return {
// ...store,
// message: message}
// isSignUpSuccesful: true