import React, { createContext, useState, useContext, useEffect } from 'react';
import { TOKEN_KEY, USER_KEY } from '../config';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// 用于本地存储已注册用户的键
const REGISTERED_USERS_KEY = 'smart_farm_registered_users';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Load user state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login functionality using API
  const login = async (email, password) => {
    try {
      // 尝试使用API登录
      const response = await authAPI.login({ email, password });
      
      const userData = response.data.user;
      const token = response.data.token;
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      // 如果API登录失败，尝试本地存储的用户
      if (useLocalStorage) {
        const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
        const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          // 创建一个不包含密码的用户数据
          const { password, ...userWithoutPassword } = foundUser;
          const userData = {
            ...userWithoutPassword,
            role: 'user'
          };
          
          // 创建一个模拟token
          const token = 'local-storage-token-' + Math.random().toString(36).substring(2);
          
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          
          setUser(userData);
          setIsAuthenticated(true);
          return userData;
        }
      }
      
      throw error;
    }
  };

  // Registration functionality using API with localStorage fallback
  const register = async (userData) => {
    try {
      // Try to register using the API (with mock data fallback)
      const response = await authAPI.register(userData);
      
      // If successful, return the data
      return response.data;
    } catch (error) {
      // If there's still an error after the fallback, throw it
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    useLocalStorage,
    setUseLocalStorage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 