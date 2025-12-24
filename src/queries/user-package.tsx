import BaseRequest from '@/config/axios.config';
import { useQuery } from '@tanstack/react-query';

export const useGetUserPackages = () => {
  return useQuery({
    queryKey: ['user-packages'],
    queryFn: async () => {
      return BaseRequest.Get('/api/UserPackage/get-user-packages');
    }
  });
};
