export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const adminNavItems: any = [
  {
    label: 'Quản lý',
    detail: [
      {
        title: 'Tổng quan',
        url: '/admin/dashboard',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Danh sách người dùng',
    detail: [
      {
        title: 'Học viên',
        url: '/admin/users/students',
        icon: 'user',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Mentor',
        url: '/admin/users/mentors',
        icon: 'userCog',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Đơn hàng',
    detail: [
      {
        title: 'Hóa đơn',
        url: '/admin/orders/invoices',
        icon: 'banknote',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },

  {
    label: 'Quản lý tài nguyên',
    detail: [
      {
        title: 'Chuyên ngành',
        url: '/admin/major',
        icon: 'list',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Môn học',
        url: '/admin/categories',
        icon: 'package',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Bài test đầu vào',
        url: '/admin/entry-tests',
        icon: 'package',
        isActive: false,
        shortcut: ['e', 't'],
        items: []
      },
      {
        title: 'Danh sách khóa học',
        url: '/admin/courses',
        icon: 'bookOpen',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
   
    ]
  },

  {
    label: 'Sự kiện',
    detail: [
      {
        title: 'Danh sách sự kiện',
        url: '/admin/events',
        icon: 'calendarclock',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Quản lý hoàn tiền',
        url: '/admin/refunds',
        icon: 'banknote',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },

 
];

export const managerNavItems: any = [
  {
    label: 'Quản lý',
    detail: [
      {
        title: 'Tổng quan',
        url: '/admin/dashboard',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Danh sách học viên',
    detail: [
      {
        title: 'Học viên',
        url: '/admin/users/students',
        icon: 'user',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },

  {
    label: 'Quản lý khóa học',
    detail: [
      {
        title: 'Khóa học quản lý',
        url: '/mentor/courses',
        icon: 'listOrdered',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'Hệ thống',
    detail: [
      {
        title: 'Tin nhắn học viên',
        url: '/mentor/chat-room',
        icon: 'messageSquare',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  }
];

export const sumaryUser = {
  CEO: 5,
  Manager: 3,
  Employee: 10
};

export const InspectionCodeRangeStatus: any = {
  1: 'Dùng hết',
  2: 'Đang sử dụng',
  3: 'Mới'
};

export const USER_ROLE = {
  ADMIN: 1,
  USER: 2,
  MENTOR: 3,
  SPEAKER: 4
};
