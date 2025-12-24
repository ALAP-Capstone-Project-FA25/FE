import BaseRequest, { BaseRequestV2 } from '@/config/axios.config';
import __helpers from '@/helpers';
import { setInfoUser } from '@/redux/auth.slice';
import { RootState } from '@/redux/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

export const useGetAllUser = (keyword) => {
  return useQuery({
    queryKey: ['get-all-user', keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('searchTerm', keyword);
      return await BaseRequest.Get(
        `/api/user-management/users?${params.toString()}`
      );
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-user'],
    mutationFn: async (model: any) => {
      return await BaseRequestV2.Put(
        `/api/user-management/users/${model.id}`,
        model
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-all-user']
      });
    }
  });
};

export const useUpdateLockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-lock-user'],
    mutationFn: async (model: any) => {
      console.log('Updating user lock status:', model);
      // Gọi API toggle-user-status với boolean isActive
      // Backend expects [FromBody] bool, so we send the new status (inverted)
      const newStatus = !model.isActive; // If currently active, send false to lock

      // Axios automatically serializes boolean to JSON, but we need to ensure it's sent correctly
      // Send as JSON string to ensure Content-Type is application/json
      return await BaseRequestV2.Put(
        `/api/Auth/toggle-user-status/${model.id}`,
        newStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users']
      });
      queryClient.invalidateQueries({
        queryKey: ['get-all-user']
      });
    }
  });
};

export const useGetMyInfo = () => {
  const dispatch = useDispatch();
  return useQuery({
    queryKey: ['get-my-info'],
    queryFn: async () => {
      const res = await BaseRequest.Get(`/api/Auth/get-info`);
      dispatch(setInfoUser(res));
      return res;
    },
    enabled: !!__helpers.cookie_get('AT')
  });
};

export const useGetMyInfoOnce = () => {
  const dispatch = useDispatch();
  const infoUser = useSelector((state: RootState) => state.auth.infoUser);
  const hasToken = !!__helpers.cookie_get('AT');

  return useQuery({
    queryKey: ['get-my-info-2'],
    queryFn: async () => {
      const res = await BaseRequest.Get(`/api/Auth/get-info`);
      dispatch(setInfoUser(res));
      return res;
    },
    enabled: hasToken && !infoUser,
    staleTime: Infinity
  });
};

export const useGetUsersByPagingByRole = (
  page: number,
  pageLimit: number,
  keyword: string,
  role: number
) => {
  return useQuery({
    queryKey: ['users', page, pageLimit, keyword, role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (role) params.append('UserRole', role.toString());
      return BaseRequest.Get(
        `/api/Auth/get-user-by-paging?${params.toString()}`
      );
    }
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationKey: ['update-my-profile'],
    mutationFn: async (profileData: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      bio?: string;
    }) => {
      return await BaseRequestV2.Put('/api/Auth/update-profile', profileData);
    },
    onSuccess: (data: any) => {
      // Cập nhật cache và Redux store
      queryClient.invalidateQueries({ queryKey: ['get-my-info'] });
      queryClient.invalidateQueries({ queryKey: ['get-my-info-2'] });
      if (data && typeof data === 'object' && 'data' in data && data.data) {
        dispatch(setInfoUser(data.data));
      }
    }
  });
};
