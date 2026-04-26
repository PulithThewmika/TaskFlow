import { useState } from 'react';
import { isAxiosError } from 'axios';
import { loginUser, registerUser } from '../api/authApi';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<AuthResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginUser(payload);
      localStorage.setItem('token', response.token);
      return response;
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerUser(payload);
      return response;
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return { login, register, logout, loading, error };
};
