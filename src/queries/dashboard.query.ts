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

// Mentor Dashboard Statistics
export const useGetMentorDashboardStats = () => {
  return useQuery({
    queryKey: ['mentor-dashboard-stats'],
    queryFn: async () => {
      // Get courses count
      const coursesResponse = await BaseRequest.Get('/api/Course/get-by-paging-by-user?pageNumber=1&pageSize=1000&keyword=');
      // Handle TFUResponse format: [error, data] or direct data
      const coursesData = Array.isArray(coursesResponse) && coursesResponse.length === 2 
        ? coursesResponse[1] 
        : coursesResponse;
      const coursesCount = coursesData?.totalRecords || coursesData?.listObjects?.length || 0;
      
      // Get chat rooms and count student messages
      const chatRoomsResponse = await BaseRequest.Get('/api/ChatRoom/get-list-by-mentor-id');
      // Handle TFUResponse format: [error, data] or direct data
      const chatRoomsData = Array.isArray(chatRoomsResponse) && chatRoomsResponse.length === 2 
        ? chatRoomsResponse[1] 
        : chatRoomsResponse;
      const chatRooms = Array.isArray(chatRoomsData) 
        ? chatRoomsData 
        : (chatRoomsData?.listObjects || chatRoomsData || []);
      
      // Count total student messages (isUser = true)
      let studentMessagesCount = 0;
      if (Array.isArray(chatRooms)) {
        chatRooms.forEach((room: any) => {
          if (room.messages && Array.isArray(room.messages)) {
            const studentMessages = room.messages.filter((msg: any) => msg.isUser === true);
            studentMessagesCount += studentMessages.length;
          }
        });
      }
      
      return {
        totalCourses: coursesCount,
        totalStudentMessages: studentMessagesCount
      };
    }
  });
};