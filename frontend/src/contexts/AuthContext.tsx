import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from './authTypes.ts';

export const AuthContext = createContext<AuthContextType | null>(null);

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('pharmacy_token');
      const savedUser = localStorage.getItem('pharmacy_user');

      if (token && savedUser) {
        try {
          const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.valid) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(parsedUser.role === 'admin');
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            console.error('Token verification failed: Invalid token');
            clearAuth();
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('Token verification failed:', error.response?.data?.message || error.message);
          } else {
            console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
          }
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('pharmacy_token');
    localStorage.removeItem('pharmacy_user');
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('pharmacy_token', token);
      localStorage.setItem('pharmacy_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'admin'); 

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      } else {
        throw new Error(error instanceof Error ? error.message : 'Login failed');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('Registering user:', { name, email, password });
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      console.log('Registration response:', response.data);
      const { user, token } = response.data;
      localStorage.setItem('pharmacy_token', token);
      localStorage.setItem('pharmacy_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      } else {
        throw new Error(error instanceof Error ? error.message : 'Registration failed');
      }
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };


  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};