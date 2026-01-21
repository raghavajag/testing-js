/**
 * App Context - Global state management
 * Contains authentication and user state
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);

  const login = useCallback(async (credentials) => {
    // Import auth service dynamically to create cross-file call chain
    const { AuthService } = await import('../services/authService');
    const result = await AuthService.authenticateUser(credentials);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => [...prev, product]);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    theme,
    cart,
    login,
    logout,
    addToCart,
    setTheme
  }), [user, theme, cart, login, logout, addToCart]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};