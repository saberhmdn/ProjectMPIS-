import React from 'react';

const About = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>About Us</h1>
            <div style={styles.content}>
                <p style={styles.text}>
                    This application is built using the MERN stack, which includes:
                </p>
                <ul style={styles.list}>
                    <li>MongoDB - A NoSQL database</li>
                    <li>Express.js - A web application framework for Node.js</li>
                    <li>React - A JavaScript library for building user interfaces</li>
                    <li>Node.js - A JavaScript runtime environment</li>
                </ul>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '1.5rem',
        color: '#333',
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '1rem',
    },
    list: {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        paddingLeft: '1.5rem',
    },
};

export default About; 