import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    localStorage.removeItem('user');
                }
            }

            // Optionally verify token validity with backend
            if (authService.isAuthenticated()) {
                try {
                    const response = await authService.getCurrentUser();
                    if (response?.success && response?.data) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // If token is invalid, logout
                    // authService.logout();
                    // setUser(null);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);

        // Safe destructuring with validation
        // authService returns response.data, so we access response.data directly (not response.data.data)
        if (response?.success && response?.data) {
            const { user, organization } = response.data;

            // Validate that user data exists
            if (user) {
                setUser({ ...user, organization });
            } else {
                console.error('Login response missing user data');
                throw new Error('Invalid response: User data not found');
            }
        } else if (response?.success === false) {
            // Backend returned success: false (handled by caller)
            return response;
        } else {
            // Unexpected response structure
            console.error('Unexpected login response structure:', response);
            throw new Error('Unexpected server response. Please try again.');
        }

        return response;
    };

    const register = async (data) => {
        const response = await authService.register(data);

        // Safe destructuring with validation
        // authService returns response.data, so we access response.data directly (not response.data.data)
        if (response?.success && response?.data) {
            const { user, organization, tokens } = response.data;

            // Validate required data exists
            if (!user) {
                console.error('Registration response missing user data');
                throw new Error('Invalid response: User data not found');
            }

            if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
                console.error('Registration response missing tokens');
                throw new Error('Invalid response: Authentication tokens not found');
            }

            // Set user state
            setUser({ ...user, organization });

            // Save tokens to localStorage
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify({ ...user, organization }));
        } else if (response?.success === false) {
            // Backend returned success: false (handled by caller)
            return response;
        } else {
            // Unexpected response structure
            console.error('Unexpected registration response structure:', response);
            throw new Error('Unexpected server response. Please try again.');
        }

        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
