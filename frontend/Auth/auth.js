// API base URL
const API_URL = 'http://localhost:5000/api';

// Function to handle signup
async function handleSignup(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        password: formData.get('password'),
        userType: formData.get('userType'),
        birthDate: formData.get('birthDate'),
        gender: formData.get('gender'),
        institution: formData.get('institution'),
        field: formData.get('field')
    };

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (response.ok) {
            alert('Signup successful!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during signup');
    }
}

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (response.ok) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 