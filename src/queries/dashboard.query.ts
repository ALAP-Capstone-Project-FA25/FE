import BaseRequest from '@/config/axios.config';
import { useQuery } from '@tanstack/react-query';

// Dashboard Statistics
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      return BaseRequest.Get('/api/Dashboard/stats');
    }
  });
};

// Revenue Chart Data
export const useGetRevenueChart = (period: string = 'month') => {
  return useQuery({
    queryKey: ['revenue-chart', period],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Dashboard/revenue-chart?period=${period}`);
    }
  });
};

// Student Growth Chart Data
export const useGetStudentGrowthChart = () => {
  return useQuery({
    queryKey: ['student-growth-chart'],
    queryFn: async () => {
      return BaseRequest.Get('/api/Dashboard/student-growth');
    }
  });
};

// Course Categories Distribution
export const useGetCourseDistribution = () => {
  return useQuery({
    queryKey: ['course-distribution'],
    queryFn: async () => {
      return BaseRequest.Get('/api/Dashboard/course-distribution');
    }
  });
};

// Top Performing Courses
export const useGetTopCourses = () => {
  return useQuery({
    queryKey: ['top-courses'],
    queryFn: async () => {
      return BaseRequest.Get('/api/Dashboard/top-courses');
    }
  });
};

// Recent Courses with Details
export const useGetRecentCourses = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-courses', limit],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Dashboard/recent-courses?limit=${limit}`);
    }
  });
};