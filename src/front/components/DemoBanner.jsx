// src/front/components/DemoBanner.jsx - Shows when in demo mode
import React from 'react';

export const DemoBanner = () => {
    const DEMO_MODE = !import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_DEMO_MODE === 'true';
    
    if (!DEMO_MODE) return null;
    
    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '12px 20px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '70px',
            zIndex: 999
        }}>
            🎭 <strong>DEMO MODE</strong> - This is a frontend-only demonstration. 
            All data is simulated and will reset on page refresh. 
            <span style={{ marginLeft: '10px', opacity: 0.9 }}>
                Try logging in with any email/password!
            </span>
        </div>
    );
};