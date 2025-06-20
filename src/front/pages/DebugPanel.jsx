// src/front/components/DebugPanel.jsx - Temporary debugging component
import React, { useState } from 'react';
import { testConnection, testAuth, debugTokenStatus, getStoredToken } from '../pages/fetch.js';

export const DebugPanel = () => {
    const [results, setResults] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    const runTest = async (testName, testFunction) => {
        try {
            const result = await testFunction();
            setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
        } catch (error) {
            setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
        }
    };

    const runAllTests = async () => {
        setResults({});
        
        // Test backend connection
        await runTest('connection', testConnection);
        
        // Test token status
        const tokenStatus = debugTokenStatus();
        setResults(prev => ({ ...prev, 'tokenStatus': { success: true, data: tokenStatus } }));
        
        // Test auth if token exists
        const token = getStoredToken();
        if (token) {
            await runTest('auth', () => testAuth(token));
        }
    };

    if (!import.meta.env.DEV) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '400px'
        }}>
            <button 
                onClick={() => setIsVisible(!isVisible)}
                style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {isVisible ? 'Hide' : 'Show'} Debug Panel
            </button>
            
            {isVisible && (
                <div style={{ marginTop: '10px' }}>
                    <button 
                        onClick={runAllTests}
                        style={{
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        Run All Tests
                    </button>
                    
                    <div>
                        <strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL || 'Not set'}
                    </div>
                    
                    {Object.entries(results).map(([testName, result]) => (
                        <div key={testName} style={{ marginTop: '5px' }}>
                            <strong>{testName}:</strong> 
                            <span style={{ color: result.success ? '#28a745' : '#dc3545' }}>
                                {result.success ? ' ✅ PASS' : ' ❌ FAIL'}
                            </span>
                            {result.error && <div style={{ color: '#dc3545', fontSize: '11px' }}>{result.error}</div>}
                            {result.data && (
                                <pre style={{ fontSize: '10px', background: '#333', padding: '5px', marginTop: '2px' }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};