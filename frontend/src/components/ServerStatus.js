import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServerStatus = () => {
    const [status, setStatus] = useState('Checking...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
                if (response.status === 200) {
                    setStatus('Connected');
                    setError(null);
                } else {
                    setStatus('Error');
                    setError(`Unexpected response: ${response.status}`);
                }
            } catch (err) {
                setStatus('Disconnected');
                if (err.code === 'ECONNABORTED') {
                    setError('Connection timeout. Server is not responding.');
                } else if (!err.response) {
                    setError('Cannot connect to server. Please check if the server is running.');
                } else {
                    setError(`Error: ${err.message}`);
                }
                console.error('Server check error:', err);
            }
        };

        checkServerStatus();
    }, []);

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: status === 'Connected' ? '#d4edda' : '#f8d7da',
            color: status === 'Connected' ? '#155724' : '#721c24',
            border: `1px solid ${status === 'Connected' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '12px'
        }}>
            <div>Server: {status}</div>
            {error && <div style={{ fontSize: '10px', marginTop: '4px' }}>{error}</div>}
        </div>
    );
};

export default ServerStatus;