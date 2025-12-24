import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetKnowledgeGraphBySubjectId = (subjectId: number) => {
  return useQuery({
    queryKey: ['knowledge-graph', subjectId],
    queryFn: () => {
      return BaseRequest.Get(
        `/api/KnowledgeGraph/subjects/${subjectId}/export`
      );
    }
  });
};

export const useImportKnowledgeGraph = () => {
  return useMutation({
    mutationFn: (data: any) => {
      return BaseRequest.Post(
        `/api/KnowledgeGraph/subjects/${data.subjectId}/import`,
        data.data
      );
    }
  });
};
