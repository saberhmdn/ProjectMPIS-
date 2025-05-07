import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

// Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on initial load
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (token) {
                    // Verify token and get user data
                    const response = await axios.get(`${config.API_BASE_URL}/api/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        
        checkLoggedIn();
    }, []);

    const login = async (credentials) => {
        try {
            console.log('Login attempt with:', credentials);
            
            // Try the general auth login endpoint first
            let response;
            try {
                response = await axios.post(`${config.API_BASE_URL}/api/auth/login`, credentials);
            } catch (error) {
                console.log('General auth login failed, trying role-specific endpoints');
                
                // If general login fails, try student login
                try {
                    response = await axios.post(`${config.API_BASE_URL}/api/students/login`, credentials);
                    // If successful, extract student data
                    if (response.data.student) {
                        response.data.user = response.data.student;
                        response.data.user.role = 'student';
                    }
                } catch (studentError) {
                    console.log('Student login failed, trying teacher login');
                    
                    // If student login fails, try teacher login
                    response = await axios.post(`${config.API_BASE_URL}/api/teachers/login`, credentials);
                    // If successful, extract teacher data
                    if (response.data.teacher) {
                        response.data.user = response.data.teacher;
                        response.data.user.role = 'teacher';
                    }
                }
            }
            
            console.log('Login response:', response.data);
            
            // Extract token and user data
            const { token, user, student, teacher } = response.data;
            
            // Use the appropriate user object
            const userData = user || student || teacher;
            
            if (!token || !userData) {
                throw new Error('Invalid response format from server');
            }
            
            localStorage.setItem('token', token);
            setUser(userData);
            
            return { token, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const register = async (userData, role) => {
        try {
            // Use the appropriate endpoint based on role
            const endpoint = role === 'teacher' 
                ? `${config.API_BASE_URL}/api/teachers/register` 
                : `${config.API_BASE_URL}/api/students/register`;
            
            console.log(`Sending registration to ${endpoint} with data:`, JSON.stringify(userData, null, 2));
            
            const response = await axios.post(endpoint, userData);
            console.log('Registration response:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('Registration error in AuthContext:', error);
            if (error.response) {
                console.error('Server error response:', error.response.data);
                console.error('Status code:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
