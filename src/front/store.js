// frontend/store.js

export const initialStore = {
  message: null,
  // Load token from localStorage on initial start
  token: localStorage.getItem("token") || null,
  // This is a good pattern to prevent app crashes on bad JSON
  user: (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  })(),
  isSignUpSuccessful: false,
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      // This action is dispatched by a component AFTER a successful API call
      localStorage.setItem("token", action.payload.token);
      if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user || null,
        message: null, // Clear any previous errors on successful login
        isSignUpSuccessful: false, // Reset signup flag
      };

    case "LOGOUT":
      // This action can be dispatched from anywhere to log the user out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null,
        message: "You have been logged out.",
      };

    case "SIGNUP_SUCCESS":
      // Dispatched AFTER a successful signup API call
      return {
        ...store,
        message: action.payload.message,
        isSignUpSuccessful: true,
      };

    case "SET_ERROR":
      // Dispatched when an API call in a component fails
      return {
        ...store,
        message: action.payload,
      };
    
    case "CLEAR_MESSAGE":
      return {
        ...store,
        message: null
      };

    default:
      return store;
  }
}