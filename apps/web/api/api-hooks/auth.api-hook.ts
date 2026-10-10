import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage, setAuthToken, removeAuthToken } from '@/lib/axios';
import {
  authApi,
  type AuthResponse,
  type LoginData,
  type RegisterData,
} from '@/api/query-list/auth.query';

export const AUTH_KEYS = {
  all: () => ['auth'] as const,
  profile: () => ['auth', 'profile'] as const,
};

export const useProfile = (enabled = true) => {
  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: () => authApi.getProfile(),
    select: (response) => response.data,
    enabled,
    retry: false,
  });
};

export const useRegister = (options?: { onSuccess?: (data: AuthResponse) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      setAuthToken(response.data.accessToken);
      queryClient.setQueryData(AUTH_KEYS.profile(), { data: response.data.user });
      toast.success('Account created successfully');
      options?.onSuccess?.(response.data);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
    },
  });
};

export const useLogin = (options?: { onSuccess?: (data: AuthResponse) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      setAuthToken(response.data.accessToken);
      queryClient.setQueryData(AUTH_KEYS.profile(), { data: response.data.user });
      toast.success('Logged in successfully');
      options?.onSuccess?.(response.data);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Invalid email or password'));
    },
  });
};

export const useLogout = (options?: { onLogout?: () => void }) => {
  const queryClient = useQueryClient();

  return () => {
    removeAuthToken();
    queryClient.removeQueries({ queryKey: AUTH_KEYS.all() });
    queryClient.clear();
    toast.success('Logged out');
    options?.onLogout?.();
  };
};
