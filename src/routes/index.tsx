import NotFound from '@/pages/not-found';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
// import ProtectedRoute from './ProtectedRoute';

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const AdminLayout = lazy(() => import('@/components/layout/admin-layout'));

// ================= LIST CLIENT ROUTES =================
const HomePage = lazy(() => import('@/pages/HomePage/index'));
const LessonPage = lazy(() => import('@/pages/LessonPage/index'));
const CourseDetailPage = lazy(() => import('@/pages/CourseDetail/index'));
const LearningPage = lazy(() => import('@/pages/LearningPage/index'));

// ================= LIST ADMIN ROUTES =================
const AdminCoursePage = lazy(
  () => import('@/pages/AdminPage/CoursePage/index')
);
const EditCoursePage = lazy(() => import('@/pages/AdminPage/CoursePage/edit'));
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const AdminCategoryPage = lazy(
  () => import('@/pages/AdminPage/CategoryPage/index')
);
const AdminTopicPage = lazy(() => import('@/pages/AdminPage/TopicPage/index'));
const AdminLessonPage = lazy(
  () => import('@/pages/AdminPage/LessonPage/index')
);
const PricingPage = lazy(() => import('@/pages/Pricing/index'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage/index'));
const KnowledgeGraphPage = lazy(() => import('@/pages/KnowledgeGrapth/index'));
const AdminStudentPage = lazy(
  () => import('@/pages/AdminPage/StudentPage/index')
);
const PaymentPage = lazy(() => import('@/pages/AdminPage/PaymentPage/index'));
const AdminDashboardPage = lazy(
  () => import('@/pages/AdminPage/Dashboard/index')
);
const AdminMentorPage = lazy(
  () => import('@/pages/AdminPage/MentorPage/index')
);
const AdminMajorPage = lazy(() => import('@/pages/AdminPage/MajorPage/index'));
const MentorCoursePage = lazy(
  () => import('@/pages/MentorPage/MentorCoursePage/index')
);
const TetsPage = lazy(() => import('@/pages/TestPage/index'));
const MentorChatRoomPage = lazy(
  () => import('@/pages/MentorPage/MentorChatRoomPage/index')
);
const MentorDashboardPage = lazy(
  () => import('@/pages/MentorPage/MentorDashboard/index')
);
const EventPage = lazy(() => import('@/pages/AdminPage/EventPage/index'));
const ClientEventPage = lazy(() => import('@/pages/EventPage/index'));
const MyEventTicketPage = lazy(() => import('@/pages/MyEventTicketPage/index'));
const MyCoursesPage = lazy(() => import('@/pages/MyCoursesPage/index'));
const EventDetailPage = lazy(
  () => import('@/pages/AdminPage/EventDetailPage/index')
);
const EventGuestPage = lazy(
  () => import('@/pages/AdminPage/EventGuestPage/index')
);
const RefundPage = lazy(() => import('@/pages/AdminPage/RefundPage/index'));
const KnowledgeGraphV2Page = lazy(
  () => import('@/pages/KnowledgeGrapthV2/index')
);
const RoadmapBySubjectPage = lazy(
  () => import('@/pages/RoadmapBySubject/index')
);
const RoadmapPageEditor = lazy(
  () => import('@/pages/AdminPage/KnowledgeGrapthEditor')
);
const PickMajorPage = lazy(() => import('@/pages/PickMajorPage/index'));
const PickCategoryToKnowledgePage = lazy(
  () => import('@/pages/PickCategoryToKnowledge/index')
);
const MajorPage = lazy(() => import('@/pages/AdminPage/MajorPage/index'));
const EntryTestList = lazy(() => import('@/pages/EntryTest/EntryTestList'));
const EntryTestWithResult = lazy(
  () => import('@/pages/EntryTest/EntryTestWithResult')
);
const AdminEntryTestPage = lazy(
  () => import('@/pages/AdminPage/EntryTestPage/index')
);
const EditEntryTestPage = lazy(
  () => import('@/pages/AdminPage/EntryTestPage/components/edit/index')
);
const AdminSpeakerPage = lazy(
  () => import('@/pages/AdminPage/SpeakerPage/index')
);
const AdminPackagePage = lazy(
  () => import('@/pages/AdminPage/PackagePage/index')
);
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage/index'));
const TestProfilePage = lazy(() => import('@/pages/TestProfilePage/index'));

const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage/index'));
const EmailVerifiedPage = lazy(() => import('@/pages/EmailVerifiedPage/index'));
const RefundInfoPage = lazy(() => import('@/pages/RefundInfoPage/index'));
const AdaptiveRecommendationsPage = lazy(
  () => import('@/pages/AdaptiveRecommendations/index')
);
const BlogPage = lazy(() => import('@/pages/BlogPage/index'));
const BlogDetailPage = lazy(() => import('@/pages/BlogPage/BlogDetailPage'));
const BlogCreateEditPage = lazy(
  () => import('@/pages/BlogPage/BlogCreateEditPage')
);
const AdminBlogPage = lazy(() => import('@/pages/AdminPage/BlogPage/index'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const dashboardRoutes = [
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          path: '/',
          element: <HomePage />,
          index: true
        },

        {
          path: '/lesson',
          element: <LessonPage />
        },
        {
          path: '/course/:id',
          element: <CourseDetailPage />
        },
        {
          path: '/pricing',
          element: <PricingPage />
        },
        {
          path: '/profile',
          element: <ProfilePage />
        },
        {
          path: '/roadmap/:id',
          element: <RoadmapBySubjectPage />
        },
        {
          path: '/events',
          element: <ClientEventPage />
        },
        {
          path: '/my-event-ticket',
          element: <MyEventTicketPage />
        },
        {
          path: '/my-courses',
          element: <MyCoursesPage />
        },
        {
          path: '/pick-category-to-knowledge',
          element: <PickCategoryToKnowledgePage />
        },
        {
          path: '/adaptive-recommendations',
          element: <AdaptiveRecommendationsPage />
        },
        {
          path: '/blog',
          element: <BlogPage />
        },
        {
          path: '/blog/:id',
          element: <BlogDetailPage />
        },
        {
          path: '/blog/create',
          element: <BlogCreateEditPage />
        },
        {
          path: '/blog/edit/:id',
          element: <BlogCreateEditPage />
        },
        {
          path: '/my-profile',
          element: <UserProfilePage />
        }
      ]
    }
  ];
  const adminRoutes = [
    {
      element: (
        <AdminLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </AdminLayout>
      ),
      children: [
        {
          path: '/admin/dashboard',
          element: <AdminDashboardPage />
        },
        {
          path: '/admin/courses',
          element: <AdminCoursePage />
        },
        {
          path: '/admin/courses/edit/:id',
          element: <EditCoursePage />
        },
        {
          path: '/admin/categories',
          element: <AdminCategoryPage />
        },
        {
          path: '/admin/courses/:courseId/topics',
          element: <AdminTopicPage />
        },
        {
          path: '/admin/courses/:courseId/topics/:topicId/lessons',
          element: <AdminLessonPage />
        },

        {
          path: '/admin/users/students',
          element: <AdminStudentPage />
        },
        {
          path: '/admin/users/mentors',
          element: <AdminMentorPage />
        },
        {
          path: '/admin/majors',
          element: <AdminMajorPage />
        },
        {
          path: '/admin/orders/invoices',
          element: <PaymentPage />
        },
        {
          path: '/mentor/dashboard',
          element: <MentorDashboardPage />
        },
        {
          path: '/mentor/courses',
          element: <MentorCoursePage />
        },
        {
          path: '/mentor/chat-room',
          element: <MentorChatRoomPage />
        },
        {
          path: '/admin/events',
          element: <EventPage />
        },
        {
          path: '/admin/events/:id',
          element: <EventDetailPage />
        },
        {
          path: '/admin/events/:id/users',
          element: <EventGuestPage />
        },
        {
          path: '/admin/refunds',
          element: <RefundPage />
        },
        {
          path: '/admin/knowledge-graph/:subjectId',
          element: <RoadmapPageEditor />
        },
        {
          path: '/admin/major',
          element: <MajorPage />
        },
        {
          path: '/admin/entry-tests',
          element: <AdminEntryTestPage />
        },
        {
          path: '/admin/entry-tests/edit/:id',
          element: <EditEntryTestPage />
        },
        {
          path: '/admin/speakers',
          element: <AdminSpeakerPage />
        },
        {
          path: '/admin/blog',
          element: <AdminBlogPage />
        },
        {
          path: '/admin/packages',
          element: <AdminPackagePage />
        },
        {
          path: '/user-profile',
          element: <UserProfilePage />
        },

        {
          path: '/test-profile',
          element: <TestProfilePage />
        }
      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/admin/login',
      element: <SignInPage />,
      index: true
    },
    {
      path: '/pick-major',
      element: <PickMajorPage />
    },

    {
      path: '/learning/:id',
      element: <LearningPage />
    },
    {
      path: '/test',
      element: <TetsPage />
    },
    {
      path: '/404',
      element: <NotFound />
    },

    {
      path: '/knowledge-graph',
      element: <KnowledgeGraphPage />
    },
    {
      path: '/knowledge-graph-v2',
      element: <KnowledgeGraphV2Page />
    },
    {
      path: '/entry-test-list',
      element: <EntryTestList />
    },
    {
      path: '/entry-test/:id',
      element: <EntryTestWithResult />
    },
    {
      path: '/reset-password',
      element: <ResetPasswordPage />
    },
    {
      path: '/email-verified',
      element: <EmailVerifiedPage />
    },
    {
      path: '/refund-info/:ticketId',
      element: <RefundInfoPage />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([
    ...dashboardRoutes,
    ...adminRoutes,
    ...publicRoutes
  ]);

  return routes;
}
