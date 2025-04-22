import React from 'react';

const Home = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to MERN Stack Application</h1>
            <p style={styles.description}>
                This is a full-stack application built with MongoDB, Express.js, React, and Node.js.
            </p>
        </div>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        padding: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        color: '#333',
    },
    description: {
        fontSize: '1.2rem',
        color: '#666',
        lineHeight: '1.6',
    },
};

export default Home; 