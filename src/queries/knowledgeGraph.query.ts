import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetPersonalizedRoadmap = (subjectId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['personalized-roadmap', subjectId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/KnowledgeGraph/subjects/${subjectId}/personalized`);
    },
  });
};

export const useStartNode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['start-node'],
    mutationFn: async (nodeId: number) => {
      return BaseRequest.Post(`/api/KnowledgeGraph/nodes/${nodeId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalized-roadmap'] });
    }
  });
};

export const useUpdateNodeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['update-node-progress'],
    mutationFn: async ({ nodeId, progressPercent }: { nodeId: number; progressPercent: number }) => {
      return BaseRequest.Put(`/api/KnowledgeGraph/nodes/${nodeId}/progress`, progressPercent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalized-roadmap'] });
    }
  });
};

export const useMarkNodeAsCompleted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['mark-node-completed'],
    mutationFn: async (nodeId: number) => {
      return BaseRequest.Post(`/api/KnowledgeGraph/nodes/${nodeId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalized-roadmap'] });
    }
  });
};
