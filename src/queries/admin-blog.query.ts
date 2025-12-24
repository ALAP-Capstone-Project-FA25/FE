import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BlogPostFilterDto } from '@/types/api.types';

// Get Admin Blog Posts (including inactive)
export const useGetAdminBlogPosts = (filter: BlogPostFilterDto) => {
  return useQuery({
    queryKey: ['admin-blog-posts', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.pageSize)
        params.append('pageSize', filter.pageSize.toString());
      if (filter.keyword) params.append('keyword', filter.keyword);
      if (filter.targetAudience)
        params.append('targetAudience', filter.targetAudience.toString());
      if (filter.tag) params.append('tag', filter.tag);
      if (filter.isActive !== undefined)
        params.append('isActive', filter.isActive.toString());

      const response = await BaseRequest.Get(
        `/api/Admin/AdminBlogPost/get-by-paging?${params.toString()}`
      );
      // Unwrap TFUResponse to get the data object
      return response?.data || response;
    }
  });
};

// Toggle Blog Post Active Status
export const useToggleBlogPostActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['toggle-blog-post-active'],
    mutationFn: async (id: number) => {
      const [error, response] = await BaseRequest.Post(
        `/api/Admin/AdminBlogPost/${id}/toggle-active`,
        {}
      );
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  });
};

// Admin Delete Blog Post
export const useAdminDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin-delete-blog-post'],
    mutationFn: async (id: number) => {
      const [error, response] = await BaseRequest.Delete(
        `/api/Admin/AdminBlogPost/${id}`
      );
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  });
};
