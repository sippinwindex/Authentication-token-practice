// src/front/components/Footer.jsx
import React from 'react';

export const Footer = () => {
    return (
        <footer className="retro-footer">
            <div className="footer-content">
                <span>
                    Made with <span className="retro-heart">❤</span> by Jandry Fernandez
                </span>
                <a
                    href="https://github.com/sippinwindex"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="SippinWindex GitHub Profile"
                    className="github-icon-link"
                >
                    <i className="fab fa-github"></i>
                </a>
            </div>
        </footer>
    );
};