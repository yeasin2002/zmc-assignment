import { axiosClient } from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    axiosClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginData) =>
    axiosClient.post<AuthResponse>('/auth/login', data),

  getProfile: () =>
    axiosClient.get<User>('/auth/me'),
};
