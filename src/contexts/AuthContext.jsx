import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.auth.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        // User not authenticated, which is fine
        console.log('No authenticated user found');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure MSW is ready
    setTimeout(checkAuth, 100);
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      // Try API first, fallback to mock authentication
      let response;
      try {
        response = await api.auth.login(credentials);
      } catch (apiError) {
        console.warn('API login failed, using fallback authentication:', apiError);
        // Fallback to mock authentication
        const mockUsers = [
          { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
          { id: 2, username: 'manager', password: 'manager123', name: 'Store Manager', role: 'manager' },
          { id: 3, username: 'user', password: 'user123', name: 'Regular User', role: 'user' }
        ];
        
        const user = mockUsers.find(u => u.username === credentials.username && u.password === credentials.password);
        
        if (user) {
          response = { 
            success: true, 
            user: { ...user, password: undefined }
          };
        } else {
          response = { 
            success: false, 
            message: 'Invalid credentials' 
          };
        }
      }
      
      if (response.success) {
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.warn('API logout failed, using fallback:', error);
      // Fallback logout - just clear local state
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const canEdit = () => {
    return user && (user.role === 'admin' || user.role === 'manager');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
    canEdit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
