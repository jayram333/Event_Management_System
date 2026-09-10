import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Error parsing user from storage:', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    return savedToken && savedToken !== 'undefined' ? savedToken : null;
  });

  const [role, setRole] = useState(() => {
    const savedRole = sessionStorage.getItem('role') || localStorage.getItem('role');
    return savedRole && savedRole !== 'undefined' ? savedRole : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
      localStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (role) {
      sessionStorage.setItem('role', role);
      localStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('role');
      localStorage.removeItem('role');
    }
  }, [role]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (selectedRole, credentials) => {
    setLoading(true);
    try {
      let res;
      if (selectedRole === 'ADMIN') {
        res = await authService.loginAdmin(credentials);
        if (res.success && res.data) {
          const adminToken = res.data.token;
          const adminData = {
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role || 'ADMIN',
          };
          setToken(adminToken);
          setRole('ADMIN');
          setUser(adminData);
          return res;
        }
      } else if (selectedRole === 'ORGANIZER') {
        res = await authService.loginOrganizer(credentials);
        if (res.success) {
          setToken(res.token);
          setRole('ORGANIZER');
          setUser(res.data);
          return res;
        }
      } else {
        res = await authService.loginUser(credentials);
        if (res.success) {
          setToken(res.token);
          setRole('USER');
          setUser(res.data);
          return res;
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (selectedRole, formData) => {
    setLoading(true);
    try {
      if (selectedRole === 'ORGANIZER') {
        return await authService.registerOrganizer(formData);
      } else {
        return await authService.registerUser(formData);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (data) => {
    setLoading(true);
    try {
      return await authService.verifyEmailOtp(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    verifyOtp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
