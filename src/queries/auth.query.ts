import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import __helpers from '@/helpers/index';

export const useLogin = () => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (model: any) => {
      return BaseRequest.Post(`/api/Auth/login`, model);
    }
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Auth/get-info`);
    }
  });
};

export const useGetTest = () => {
  return useQuery({
    queryKey: ['get-test'],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Auth/test-api`);
    }
  });
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: async (model: any) => {
      return BaseRequest.Post(`/api/Auth/register`, model);
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async (email: string) => {
      const formData = new FormData();
      formData.append('email', email);
      return BaseRequest.Post(`/api/Auth/send-mail-reset-password`, formData);
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationKey: ['reset-password'],
    mutationFn: async (model: { token: string; newPassword: string }) => {
      return BaseRequest.Put(`/api/Auth/reset-password`, model);
    }
  });
};
