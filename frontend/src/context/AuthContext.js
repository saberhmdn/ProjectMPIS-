import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Make sure token is included in the request
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/api/auth/me');
                    
                    // Add role to user data if it's not included in the response
                    const userData = response.data;
                    if (!userData.role) {
                        // Try to determine role from token or set a default
                        userData.role = 'student'; // Default role
                    }
                    
                    setUser(userData);
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

    const login = async (email, password, role) => {
        try {
            console.log('Login attempt with:', { email, role });
            
            // Use the correct endpoint based on role
            const endpoint = role === 'teacher' 
                ? '/api/teachers/login' 
                : '/api/students/login';
            
            console.log('Using login endpoint:', endpoint);
            
            const response = await api.post(endpoint, { email, password });
            console.log('Login response received');
            
            // Extract token and user data
            const { token, teacher, student } = response.data;
            const userData = teacher || student;
            
            if (!token) {
                console.error('No token received in login response');
                throw new Error('Authentication failed: No token received');
            }
            
            if (!userData) {
                console.error('No user data received in login response');
                throw new Error('Authentication failed: No user data received');
            }
            
            // Store token in localStorage
            localStorage.setItem('token', token);
            console.log('Token stored in localStorage');
            
            // Create user object with role
            const userObject = {
                ...userData,
                role: role
            };
            
            // Set user in context
            setUser(userObject);
            console.log('User set in context:', userObject);
            
            return { success: true, user: userObject };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData, role) => {
        try {
            const endpoint = role === 'teacher' ? '/api/teachers/register' : '/api/students/register';
            const response = await api.post(endpoint, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Add a function to check if the token is valid
    const checkToken = () => {
        const token = localStorage.getItem('token');
        console.log('Current token in localStorage:', token);
        return !!token;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
