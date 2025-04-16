import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser({ userId: decoded.userId });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      if (response.token) {
        const decoded = jwtDecode(response.token);
        setUser({ userId: decoded.userId });
        navigate('/');
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Failed to login' };
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email, password) => {
    try {
      setLoading(true);
      await authService.signup(email, password);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Failed to sign up' };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};