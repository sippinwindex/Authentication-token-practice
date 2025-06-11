export const initialStore = {
    message: null,
    // ### NOTE ###: This logic to rehydrate state from localStorage is correct.
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
};

// ### FIX ###: I've added the missing logic and combined the cases into one reducer.
export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            return {
                ...store,
                token: action.payload.token,
                user: action.payload.user,
                message: "Login successful!",
            };

        case 'LOGOUT':
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return {
                ...store,
                token: null,
                user: null,
                message: "You have been logged out.",
            };
        
        case 'SET_HELLO_MESSAGE': // Example case for your Home component
            return {
                ...store,
                message: action.payload
            };

// case 'isSignUpSuccesful'
// {
//   const {message, isSignUpSuccesful} = action.payload;
//   return {
//   ...store,
//   message: message,
//   isSignUpSuccessful: isSignUpSuccesful,
//   }
//}
        case 'fetchedtoken': // This case was empty before
            // If it's meant to do nothing, just return the existing store
            return store;

        default:
            // console.warn('Unknown action type:', action.type); // Optional: for debugging
            return store;
    }
}

// isLoginSuccesful: false, 

//export default function storeReducer(store, action = {}) {
// case 'fetchedToken':
// {
//  const {message, token, isLoginSuccesful} = action,payload;

//  return {
//   ...store,
//   message: message,
//  token: token,
//  isLoginSuccesful: isLoginSuccesful,
//    }
// }

// case 'loggedOut':
//{
// const {message, token, isLoginSuccesful} = action.payload;
// sessionStorage.removeItem('token');
// return {
// ...store,
// message: message}
// isSignUpSuccesful: true