// src/front/main.jsx - Updated for demo mode
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer';
import { InjectRoutes } from './routes';
import { BackendURL } from './components/BackendURL';
import "./pages/layout.css";

const Main = () => {
  // Check if we're in demo mode
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // In demo mode, skip the backend URL check
  if (DEMO_MODE) {
    console.log('🎭 Running in DEMO MODE - No backend required');
    return (
      <StoreProvider>
        <InjectRoutes />
      </StoreProvider>
    );
  }

  // In live mode, check for backend URL
  if (!backendUrl || backendUrl === '') {
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