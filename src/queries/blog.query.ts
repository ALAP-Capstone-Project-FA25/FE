import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateUpdateBlogPostDto,
  CreateBlogPostCommentDto,
  BlogPostFilterDto
} from '@/types/api.types';

// Get Blog Posts with paging and filters
export const useGetBlogPosts = (filter: BlogPostFilterDto) => {
  return useQuery({
    queryKey: ['blog-posts', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.pageSize)
        params.append('pageSize', filter.pageSize.toString());
      if (filter.keyword) params.append('keyword', filter.keyword);
      if (filter.targetAudience)
        params.append('targetAudience', filter.targetAudience.toString());
      if (filter.tag) params.append('tag', filter.tag);

      const response = await BaseRequest.Get(
        `/api/BlogPost/get-by-paging?${params.toString()}`
      );
      // Unwrap TFUResponse to get the data object
      return response?.data || response;
    }
  });
};

// Get Blog Post by ID
export const useGetBlogPostById = (id: number) => {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const response = await BaseRequest.Get(`/api/BlogPost/${id}`);
      // BaseRequest.Get already unwraps via interceptor, then unwraps response.data
      // So response here is the blog post data directly
      // But we need to check: if response has .data property, use it; otherwise use response
      return response?.data || response;
    },
    enabled: !!id
  });
};

// Create or Update Blog Post
export const useCreateUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-update-blog-post'],
    mutationFn: async (data: CreateUpdateBlogPostDto) => {
      const [error, response] = await BaseRequest.Post(
        `/api/BlogPost/create-update`,
        data
      );
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  });
};

// Delete Blog Post
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delete-blog-post'],
    mutationFn: async (id: number) => {
      const [error, response] = await BaseRequest.Delete(
        `/api/BlogPost/delete/${id}`
      );
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  });
};

// Like/Unlike Blog Post
export const useLikeBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['like-blog-post'],
    mutationFn: async (id: number) => {
      const [error, response] = await BaseRequest.Post(
        `/api/BlogPost/${id}/like`,
        {}
      );
      if (error) throw error;
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    }
  });
};

// Create Comment
export const useCreateBlogPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-blog-post-comment'],
    mutationFn: async (data: CreateBlogPostCommentDto) => {
      const [error, response] = await BaseRequest.Post(
        `/api/BlogPost/${data.blogPostId}/comment`,
        data
      );
      if (error) throw error;
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['blog-post', variables.blogPostId]
      });
    }
  });
};

// Delete Comment
export const useDeleteBlogPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delete-blog-post-comment'],
    mutationFn: async ({
      commentId,
      blogPostId
    }: {
      commentId: number;
      blogPostId: number;
    }) => {
      const [error, response] = await BaseRequest.Delete(
        `/api/BlogPost/comment/${commentId}`
      );
      if (error) throw error;
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['blog-post', variables.blogPostId]
      });
    }
  });
};

// Get Popular Tags
export const useGetPopularTags = (limit: number = 10) => {
  return useQuery({
    queryKey: ['blog-popular-tags', limit],
    queryFn: async () => {
      const response = await BaseRequest.Get(
        `/api/BlogPost/tags/popular?limit=${limit}`
      );
      // Unwrap TFUResponse to get the data object
      return response?.data || response;
    }
  });
};
