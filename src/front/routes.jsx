// src/front/routes.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './pages/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { Private } from './pages/Private.jsx';
import { Single } from './pages/Single.jsx';

// Note: ScrollToTop is now inside Layout.jsx, where it is more effective.
export const InjectRoutes = () => {
  const basename = import.meta.env.VITE_BASENAME || '';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* The Layout route now correctly wraps all your pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/private" element={<Private />} />
          {/* Use /invoice/:theId as the single, canonical route for invoice details */}
          <Route path="/invoice/:theId" element={<Single />} />
          
          {/* All other paths will show this "Not found" page */}
          <Route path="*" element={
            <div className="glass-panel" style={{textAlign: 'center', maxWidth: '500px'}}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};