// src/front/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer';
import { InjectRoutes } from './routes';
import { BackendURL } from './components/BackendURL';
import './index.css';

const Main = () => {
  if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === '') {
    return <BackendURL />;
  }
  return (
    <StoreProvider>
      <InjectRoutes />
    </StoreProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element with id "root" not found in the DOM');
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  );
}