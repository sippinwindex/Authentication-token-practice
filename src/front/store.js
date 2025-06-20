// frontend/store.js

// Your initialStore is excellent and includes a helpful getter.
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
  get isAuthenticated() {
    return !!this.token;
  },
  loading: false,
};

// =======================================================================
// THIS IS YOUR FULL-FEATURED REDUCER. IT IS NOW THE ONE AND ONLY DEFAULT EXPORT.
// =======================================================================
export default function storeReducer(store, action = {}) {
  // Your console.log is great for debugging.
  console.log('🔄 Store reducer handling:', action.type);
  
  switch (action.type) {
    case "LOGIN_SUCCESS":
      console.log('✅ LOGIN_SUCCESS: Setting token and user');
      localStorage.setItem("token", action.payload.token);
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user || null,
        message: null,
        isSignUpSuccessful: false,
        loading: false,
      };

    case "LOGOUT":
    case "CLEAR_TOKEN":
      console.log('🚪 LOGOUT/CLEAR_TOKEN: Clearing all auth data');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null,
        message: action.type === "LOGOUT" ? "You have been logged out." : null,
        loading: false,
      };

    // Your extra actions are preserved because they are good.
    case "RESTORE_TOKEN":
      console.log('🔄 RESTORE_TOKEN: Restoring token from localStorage');
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user || store.user,
        loading: false,
      };

    case "SIGNUP_SUCCESS":
      return {
        ...store,
        message: action.payload.message,
        isSignUpSuccessful: true,
        loading: false,
      };

    case "SET_ERROR":
      return {
        ...store,
        message: action.payload,
        loading: false,
      };

    case "CLEAR_MESSAGE":
      return {
        ...store,
        message: null
      };

    case "SET_LOADING":
      return {
        ...store,
        loading: action.payload,
      };

    case "UPDATE_USER":
      const updatedUser = { ...store.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return {
        ...store,
        user: updatedUser,
      };

    default:
      // This is also helpful for finding unhandled actions.
      console.warn('⚠️ Unknown action type:', action.type);
      return store;
  }
}
