import BaseRequest from '@/config/axios.config';

export interface MeetLinkResponse {
  meetLink: string;
  mentorId?: number;
  studentId?: number;
  createdAt?: string;
  createdBy?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  statusCode: number;
}

class MeetService {
  /**
   * Tạo link Google Meet mới - gọi API backend để tạo link cố định
   */
  async generateMeetLink(): Promise<string> {
    try {
      // Gọi API backend để tạo link meeting thật (cố định)
      // BaseRequest.Post trả về [error, response] với response là TFUResponse
      const [error, response] = await BaseRequest.Post<{ meetLink: string }>(
        '/api/meet/generate-link'
      );

      if (error) {
        console.error('API Error:', error);
        // Fallback: sử dụng link mặc định nếu API lỗi
        const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
        return defaultMeetLink;
      }

      // Lấy meetLink từ response (response là TFUResponse, response.data là object chứa meetLink)
      const meetLink = response?.data?.meetLink;

      if (!meetLink) {
        console.warn(
          'Không nhận được link meeting từ server, sử dụng link mặc định'
        );
        // Fallback: sử dụng link mặc định nếu không có meetLink
        const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
        return defaultMeetLink;
      }

      return meetLink;
    } catch (error: any) {
      console.error('Error generating meet link:', error);
      // Fallback: sử dụng link mặc định nếu có lỗi
      const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
      return defaultMeetLink;
    }
  }

  /**
   * Tạo link Google Meet cho cuộc họp giữa mentor và student
   */
  async generateMeetLinkForSession(
    mentorId: number,
    studentId: number
  ): Promise<MeetLinkResponse> {
    try {
      // Gọi API backend để tạo link meeting cho session
      // BaseRequest.Get trả về response.data (TFUResponse) trực tiếp
      const response = await BaseRequest.Get<{ data: MeetLinkResponse }>(
        `/api/meet/generate-link/${mentorId}/${studentId}`
      );

      // Lấy dữ liệu từ response (response là TFUResponse, response.data là MeetLinkResponse)
      const meetingInfo = response?.data;

      if (!meetingInfo?.meetLink) {
        console.warn(
          'Không nhận được link meeting từ server, sử dụng link mặc định'
        );
        // Fallback: sử dụng link mặc định nếu không có meetLink
        const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
        return {
          meetLink: defaultMeetLink,
          mentorId,
          studentId,
          createdAt: new Date().toISOString(),
          createdBy: mentorId
        };
      }

      return {
        meetLink: meetingInfo.meetLink,
        mentorId: meetingInfo.mentorId || mentorId,
        studentId: meetingInfo.studentId || studentId,
        createdAt: meetingInfo.createdAt || new Date().toISOString(),
        createdBy: meetingInfo.createdBy || mentorId
      };
    } catch (error: any) {
      console.error('Error generating meet link for session:', error);
      // Fallback: sử dụng link mặc định nếu có lỗi
      const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
      return {
        meetLink: defaultMeetLink,
        mentorId,
        studentId,
        createdAt: new Date().toISOString(),
        createdBy: mentorId
      };
    }
  }

  /**
   * Tạo link Google Meet nhanh - gọi endpoint /quick
   * Trả về link trực tiếp từ API
   */
  async quickMeet(): Promise<string> {
    try {
      // Gọi API backend endpoint /quick - trả về string trực tiếp trong data
      const [error, response] = await BaseRequest.Post<string>(
        '/api/meet/quick'
      );

      if (error) {
        console.error('API Error:', error);
        // Fallback: sử dụng link mặc định nếu API lỗi
        const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
        return defaultMeetLink;
      }

      // Lấy link từ response (response là TFUResponse, response.data là string)
      const meetLink = response?.data;

      if (!meetLink) {
        console.warn(
          'Không nhận được link meeting từ server, sử dụng link mặc định'
        );
        // Fallback: sử dụng link mặc định nếu không có meetLink
        const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
        return defaultMeetLink;
      }

      return meetLink;
    } catch (error: any) {
      console.error('Error generating quick meet link:', error);
      // Fallback: sử dụng link mặc định nếu có lỗi
      const defaultMeetLink = 'https://meet.google.com/odm-qtej-sgs';
      return defaultMeetLink;
    }
  }

  /**
   * Tạo Meet link nhanh và copy vào clipboard
   */
  async generateAndCopyMeetLink(): Promise<string> {
    try {
      const meetLink = await this.generateMeetLink();

      // Copy vào clipboard nếu browser hỗ trợ
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(meetLink);
        console.log('Meet link đã được copy vào clipboard');
      }

      return meetLink;
    } catch (error: any) {
      console.error('Error generating and copying meet link:', error);
      throw error;
    }
  }

  /**
   * Mở Meet link trong tab mới
   */
  openMeetLink(meetLink: string): void {
    window.open(meetLink, '_blank', 'noopener,noreferrer');
  }

  /**
   * Tạo và mở Meet link ngay lập tức
   */
  async generateAndOpenMeetLink(): Promise<string> {
    try {
      const meetLink = await this.generateMeetLink();
      this.openMeetLink(meetLink);
      return meetLink;
    } catch (error: any) {
      console.error('Error generating and opening meet link:', error);
      throw error;
    }
  }
}

export default new MeetService();
