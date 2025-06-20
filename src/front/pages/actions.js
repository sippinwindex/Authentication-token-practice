// src/front/store/actions.js
// Helper functions to create action objects for your reducer

export const loginSuccess = (token, user) => ({
    type: 'LOGIN_SUCCESS',
    payload: { token, user }
});

export const logout = () => ({
    type: 'LOGOUT'
});

export const setHelloMessage = (message) => ({
    type: 'SET_HELLO_MESSAGE',
    payload: message
});

export const signupSuccess = (message) => ({
    type: 'SIGNUP_SUCCESS',
    payload: { message, isSignUpSuccessful: true }
});

// You can add more action creators as needed
export const clearMessage = () => ({
    type: 'CLEAR_MESSAGE'
});

export const setError = (message) => ({
    type: 'SET_ERROR',
    payload: message
});