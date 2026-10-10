'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  type AuthResponse,
  type LoginData,
  type RegisterData,
  type User,
} from '@/api/query-list/auth.query';
import { AUTH_KEYS } from '@/api/api-hooks/auth.api-hook';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const queryClient = useQueryClient();

  const {
    data: profileUser,
    isLoading: isProfileLoading,
    refetch,
  } = useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: async () => {
      const res = await authApi.getProfile();
      return res.data;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = token ? profileUser ?? null : null;
  const isLoading = Boolean(token) && isProfileLoading;

  const login = useCallback(
    async (data: LoginData): Promise<AuthResponse> => {
      const response = await authApi.login(data);
      const { accessToken, user: authUser } = response.data;
      setAuthToken(accessToken);
      setToken(accessToken);
      queryClient.setQueryData(AUTH_KEYS.profile(), authUser);
      return response.data;
    },
    [queryClient],
  );

  const register = useCallback(
    async (data: RegisterData): Promise<AuthResponse> => {
      const response = await authApi.register(data);
      const { accessToken, user: authUser } = response.data;
      setAuthToken(accessToken);
      setToken(accessToken);
      queryClient.setQueryData(AUTH_KEYS.profile(), authUser);
      return response.data;
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    removeAuthToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: AUTH_KEYS.all() });
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    if (token) {
      await refetch();
    }
  }, [refetch, token]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
