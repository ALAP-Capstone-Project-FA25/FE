import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetTopicQuestionsByPaging = (
  page: number,
  pageLimit: number,
  keyword: string,
  topicId: number
) => {
  return useQuery({
    queryKey: ['topic-questions', page, pageLimit, keyword, topicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (topicId) params.append('TopicId', topicId.toString());
      return BaseRequest.Get(
        `/api/TopicQuestion/get-by-paging?${params.toString()}`
      );
    }
  });
};

export const useCreateUpdateTopicQuestion = () => {
  return useMutation({
    mutationKey: ['create-update-topic-question'],
    mutationFn: async (data: any) => {
      return BaseRequest.Post(
        '/api/TopicQuestion/create-update-with-answers',
        data
      );
    }
  });
};

export const useDeleteTopicQuestion = () => {
  return useMutation({
    mutationKey: ['delete-topic-question'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/TopicQuestion/delete/${id}`);
    }
  });
};
