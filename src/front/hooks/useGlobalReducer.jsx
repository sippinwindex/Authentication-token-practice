// src/front/hooks/useGlobalReducer.jsx
import React, { useContext, useReducer, createContext } from 'react';
import storeReducer, { initialStore } from '../store.js';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
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