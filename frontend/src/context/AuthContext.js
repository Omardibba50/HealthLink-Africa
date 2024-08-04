import React, { createContext, useState, useEffect } from 'react';
import axios from '../config/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['x-auth-token'] = token;
          const res = await axios.get('/api/auth');
          setUser(res.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching user:', err);
          setUser(null);
          setError('Failed to fetch user data');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      // Fetch user data after successful login
      const userRes = await axios.get('/api/auth');
      setUser(userRes.data);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'An error occurred during login');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;