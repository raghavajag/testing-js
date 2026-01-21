/**
 * Authentication Hook - User authentication state management
 * Uses auth service with complex call chains
 */

import { useState, useCallback } from 'react';
import { AuthService, UserService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    return loginHandler(credentials);
  }, []);

  const loginHandler = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.authenticateUser(credentials);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(async (userData) => {
    return registerHandler(userData);
  }, []);

  const registerHandler = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AuthService.registerUser(userData);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    return updateProfileHandler(profileData);
  }, []);

  const updateProfileHandler = async (profileData) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const result = await UserService.updateUserProfile(user.id, profileData);
      if (result.success) {
        // Update local user state
        setUser(prev => ({ ...prev, ...profileData }));
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };
};