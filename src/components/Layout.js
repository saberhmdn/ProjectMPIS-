import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div>
            <nav style={styles.nav}>
                <div style={styles.navContainer}>
                    <Link to="/" style={styles.navLink}>Home</Link>
                    <Link to="/about" style={styles.navLink}>About</Link>
                    <Link to="/contact" style={styles.navLink}>Contact</Link>
                </div>
            </nav>
            <main style={styles.main}>
                {children}
            </main>
        </div>
    );
};

const styles = {
    nav: {
        backgroundColor: '#333',
        padding: '1rem',
    },
    navContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '1rem',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
    },
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    },
};

export default Layout; 