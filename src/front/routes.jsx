// src/front/routes.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Layout } from './pages/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Demo } from './pages/Demo.jsx';
import { Single } from './pages/Single.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { Private } from './pages/Private.jsx';

export const InjectRoutes = () => {
  const basename = import.meta.env.VITE_BASENAME || '';

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/private" element={<Private />} />
            <Route path="/single/:theId" element={<Single />} />
            <Route path="/invoice/:theId" element={<Single />} />
            <Route path="*" element={<h1>Not found!</h1>} />
          </Route>
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
};