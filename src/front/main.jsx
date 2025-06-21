// src/front/main.jsx - Updated for demo mode with better detection
import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './hooks/useGlobalReducer';
import { InjectRoutes } from './routes';
import { BackendURL } from './components/BackendURL';
import "./pages/layout.css";

const Main = () => {
  // Check if we're in demo mode - default to demo if no backend URL is provided
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || 
                    !import.meta.env.VITE_BACKEND_URL || 
                    import.meta.env.VITE_BACKEND_URL === '';
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  console.log('🔧 Environment check:', {
    DEMO_MODE,
    VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    NODE_ENV: import.meta.env.NODE_ENV
  });

  // In demo mode or if no backend URL, skip the backend URL check
  if (DEMO_MODE) {
    console.log('🎭 Running in DEMO MODE - No backend required');
    return (
      <StoreProvider>
        <InjectRoutes />
      </StoreProvider>
    );
  }

  // Only show BackendURL component if we have a backend URL but it's empty
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