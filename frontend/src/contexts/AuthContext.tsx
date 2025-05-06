import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from './authTypes.ts';

export const AuthContext = createContext<AuthContextType | null>(null);

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
      setIsLoading(true);
      const token = localStorage.getItem('pharmacy_token');
      const savedUser = localStorage.getItem('pharmacy_user');

      if (token && savedUser) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.data?.valid) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(parsedUser.role === 'admin');
          } else {
            clearAuth();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('pharmacy_token');
    localStorage.removeItem('pharmacy_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data.data;
      const { token } = response.data;
      
      localStorage.setItem('pharmacy_token', token);
      localStorage.setItem('pharmacy_user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'admin');

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user?.role;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const { user, token } = response.data;
      localStorage.setItem('pharmacy_token', token);
      localStorage.setItem('pharmacy_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user?.role === 'admin');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    clearAuth();
    setTimeout(() => {
      navigate('/signin');
    }, 0);
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