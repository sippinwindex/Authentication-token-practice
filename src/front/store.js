// src/front/store.js
export const initialStore = {
  message: null,
  token: localStorage.getItem("token") || null,
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
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        message: "Login successful!",
      };

    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null,
        message: "You have been logged out.",
      };

    case "SIGNUP_SUCCESS":
      return {
        ...store,
        message: action.payload.message,
        isSignUpSuccessful: action.payload.isSignUpSuccessful,
      };

    case "CLEAR_MESSAGE":
      return {
        ...store,
        message: null,
      };

    case "SET_ERROR":
      return {
        ...store,
        message: action.payload,
      };

    case "SET_HELLO_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    case "FETCHED_TOKEN":
      return {
        ...store,
        token: action.payload.token,
        message: action.payload.message || "Token fetched successfully",
      };

    default:
      // console.warn("Unknown action type:", action.type); // Uncomment for debugging
      return store;
  }
}