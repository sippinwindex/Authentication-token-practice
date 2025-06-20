// src/front/hooks/useGlobalReducer.jsx
import React, { useContext, useReducer, createContext } from 'react';
import storeReducer, { initialStore } from '../store.js';


const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // useReducer correctly initializes the state using your initialStore from store.js.
  // The line `token: localStorage.getItem("token") || null` inside your initialStore
  // already handles loading the token when the app starts.
  const [store, dispatch] = useReducer(storeReducer, initialStore);
  
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};


const useGlobalReducer = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useGlobalReducer must be used within a StoreProvider');
  }
  return context;
};

export default useGlobalReducer;