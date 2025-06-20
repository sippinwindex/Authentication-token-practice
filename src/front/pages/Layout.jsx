// src/front/pages/Layout.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar.jsx";
import { Footer } from "../components/Footer.jsx";
import ScrollToTop from '../components/ScrollToTop.jsx';

export const Layout = () => {
    return (
        <ScrollToTop>
            {/* This div is the MOST IMPORTANT structural element for your CSS */}
            <div className="app-wrapper">
                <Navbar />
                {/* The <main> tag holds the content and provides top padding */}
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    );
};