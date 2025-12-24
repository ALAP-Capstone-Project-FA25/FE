import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BaseRequest from '@/config/axios.config';

export interface CreateSpeakerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
  expertise?: string;
}

export interface Speaker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export interface SpeakerListResponse {
  listObjects: Speaker[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Create speaker mutation
export const useCreateSpeaker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSpeakerRequest) => {
      const response = await BaseRequest.Post('/api/Speaker/create', data);
      if (response[0]) {
        throw new Error(response[0]?.data?.message || 'Failed to create speaker');
      }
      return response[1];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
    }
  });
};

// Get speakers list
export const useGetSpeakers = (page: number = 1, pageSize: number = 10, keyword: string = '') => {
  return useQuery({
    queryKey: ['speakers', page, pageSize, keyword],
    queryFn: async (): Promise<SpeakerListResponse> => {
      const response = await BaseRequest.Get(
        `/api/Speaker/list?page=${page}&pageSize=${pageSize}&keyword=${keyword}`
      );
      return response;
    }
  });
};

// Get speaker details
export const useGetSpeakerDetails = (id: number) => {
  return useQuery({
    queryKey: ['speaker-details', id],
    queryFn: async () => {
      const response = await BaseRequest.Get(`/api/Speaker/${id}/details`);
      return response;
    },
    enabled: !!id
  });
};