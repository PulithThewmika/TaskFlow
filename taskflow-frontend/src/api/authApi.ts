import axiosInstance from './axiosInstance';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth.types';

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
  return data;
};
