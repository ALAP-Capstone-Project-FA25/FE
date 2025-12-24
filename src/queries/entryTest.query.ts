import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateUpdateEntryTestDto,
  EntryTestModel,
  SubmitEntryTestDto
} from '@/types/api.types';

// Get Entry Test by ID
export const useGetEntryTestById = (id: number) => {
  return useQuery({
    queryKey: ['entry-test', id],
    queryFn: async (): Promise<EntryTestModel> => {
      return BaseRequest.Get(`/api/EntryTest/${id}`);
    },
    enabled: !!id
  });
};

// Get All Active Entry Tests
export const useGetAllActiveEntryTests = () => {
  return useQuery({
    queryKey: ['entry-tests-active'],
    queryFn: async () => {
      return BaseRequest.Get('/api/EntryTest/active-list');
    }
  });
};

// Get User Test Result
export const useGetUserTestResult = (entryTestId: number) => {
  return useQuery({
    queryKey: ['entry-test-result', entryTestId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/EntryTest/user-result/${entryTestId}`);
    },
    enabled: entryTestId > 0
  });
};

// Get Entry Tests with Paging
export const useGetListEntryTestByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['entry-tests', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(
        `/api/EntryTest/get-by-paging?${params.toString()}`
      );
    }
  });
};

// Create or Update Entry Test
export const useCreateUpdateEntryTest = () => {
  return useMutation({
    mutationKey: ['create-update-entry-test'],
    mutationFn: async (data: CreateUpdateEntryTestDto) => {
      return BaseRequest.Post('/api/EntryTest/create-update', data);
    }
  });
};

// Delete Entry Test
export const useDeleteEntryTest = () => {
  return useMutation({
    mutationKey: ['delete-entry-test'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/EntryTest/delete/${id}`);
    }
  });
};

// Submit Entry Test
export const useSubmitEntryTest = () => {
  return useMutation({
    mutationKey: ['submit-entry-test'],
    mutationFn: async (data: SubmitEntryTestDto) => {
      return BaseRequest.Post('/api/EntryTest/submit', data);
    }
  });
};
