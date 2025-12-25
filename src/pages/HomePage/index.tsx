import { useEffect, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCategoriesByPagingByMajor } from '@/queries/category.query';
import { motion } from 'framer-motion';
import { useRouter } from '@/routes/hooks';
import { useGetMyInfo } from '@/queries/user.query';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { CourseType } from '@/types/api.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Bắt đầu A-Level từ con số 0
// Nền tảng hỗ trợ học sinh Việt Nam làm quen với hệ thống A-Level quốc tế một cách dễ hiểu và có lộ trình.

// Hiểu đúng A-Level trước khi học sâu
// Giải thích cấu trúc AS – A2, môn học, kỳ thi và cách lựa chọn phù hợp ngay từ đầu.

// Học A-Level theo lộ trình rõ ràng
// Nội dung được thiết kế từ cơ bản đến nâng cao, giúp người mới không bị “choáng” khi tiếp cận chương trình.

// Tài nguyên chuẩn – Học tập có định hướng
// Video, tài liệu và bài học được chọn lọc nhằm hỗ trợ quá trình làm quen và xây nền tảng vững chắc.

// Cầu nối từ học sinh Việt Nam đến A-Level quốc tế
// Đồng hành cùng người học trong giai đoạn định hướng, chuẩn bị và phát triển tư duy học thuật.

const heroSlides = [
  {
    id: 1,
    title: 'Bắt đầu A-Level từ con số 0',
    description:
      'Nền tảng hỗ trợ học sinh Việt Nam làm quen với hệ thống A-Level quốc tế một cách dễ hiểu và có lộ trình.',
    // oldPrice: '9.999K',
    // newPrice: '6.499K',
    gradient: 'from-blue-600 via-sky-600 to-indigo-700',
    note1: 'Hiểu đúng A-Level trước khi học sâu',
    note2:
      'Giải thích cấu trúc AS – A2, môn học, kỳ thi và cách lựa chọn phù hợp ngay từ đầu.',
    accent: 'from-orange-400 to-orange-600',
    buttonText: 'ĐĂNG KÝ HỌC THỬ'
  },

  {
    id: 2,
    title: 'Hiểu đúng A-Level trước khi học sâu',
    description:
      'Giải thích cấu trúc AS – A2, môn học, kỳ thi và cách lựa chọn phù hợp ngay từ đầu.',
    // oldPrice: '12.499K',
    // newPrice: '7.899K',
    note1: 'Học A-Level theo lộ trình rõ ràng',
    note2:
      'Nội dung được thiết kế từ cơ bản đến nâng cao, giúp người mới không bị “choáng” khi tiếp cận chương trình.',
    gradient: 'from-purple-600 via-purple-700 to-purple-900',
    accent: 'from-emerald-400 to-teal-500',
    buttonText: 'XEM CHI TIẾT LỘ TRÌNH'
  },

  {
    id: 3,
    title: 'Tài nguyên chuẩn – Học tập có định hướng',
    description:
      'Video, tài liệu và bài học được chọn lọc nhằm hỗ trợ quá trình làm quen và xây nền tảng vững chắc.',
    // oldPrice: '11.999K',
    // newPrice: '7.499K',
    note1: 'Cầu nối từ học sinh Việt Nam đến A-Level quốc tế',
    note2:
      'Đồng hành cùng người học trong giai đoạn định hướng, chuẩn bị và phát triển tư duy học thuật.',
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
    accent: 'from-yellow-400 to-orange-500',
    buttonText: 'THAM GIA NGAY'
  }
];

export default function F8LearningPlatform() {
  const { data: infoUser } = useGetMyInfo();
  const majorId = infoUser?.majorId;
  const { data: categoriesData, refetch } = useGetCategoriesByPagingByMajor(
    1,
    50,
    '',
    majorId
  );
  const allCategories = categoriesData?.listObjects || [];

  // Filter state
  const [courseTypeFilter, setCourseTypeFilter] = useState<CourseType | 'ALL'>(
    'ALL'
  );

  // Filter categories and courses based on courseTypeFilter
  const categories = allCategories.map((category: any) => {
    if (!category.courses || category.courses.length === 0) {
      return category;
    }

    let filteredCourses = category.courses;
    if (courseTypeFilter !== 'ALL') {
      filteredCourses = category.courses.filter((course: any) => {
        if (courseTypeFilter === CourseType.BOTH) {
          return course.courseType === CourseType.BOTH;
        }
        return (
          course.courseType === courseTypeFilter ||
          course.courseType === CourseType.BOTH
        );
      });
    }

    return {
      ...category,
      courses: filteredCourses
    };
  });

  useEffect(() => {
    if (majorId != null) {
      refetch();
    }
  }, [majorId]);

  // Đã xóa formatPrice vì không còn hiển thị giá

  const router = useRouter();

  // Tour guide state
  const [runTour, setRunTour] = useState(false);

  // Tour steps cho HomePage - chỉ giữ step 2 và 3
  const homePageSteps: Step[] = [
    {
      target: '.categories-section',
      content:
        'Đây là nơi hiển thị tất cả các danh mục khóa học theo chuyên ngành của bạn.',
      title: 'Danh mục khóa học',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '.course-card:first-child',
      content:
        'Mỗi thẻ khóa học hiển thị thông tin cơ bản và nút "Xem ngay" để xem chi tiết.',
      title: 'Thẻ khóa học',
      placement: 'top'
    }
  ];

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('homepage-tour-seen', 'true');
    }
  };

  // Tự động bắt đầu tour khi component mount và có dữ liệu (chỉ 1 lần)
  useEffect(() => {
    if (categories.length > 0) {
      const hasSeenTour = localStorage.getItem('homepage-tour-seen');
      if (!hasSeenTour) {
        setTimeout(() => {
          setRunTour(true);
        }, 1000); // Delay 1s để UI render xong
      }
    }
  }, [categories.length]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Auto chạy qua lại giữa các slide (ping-pong)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === heroSlides.length - 1) {
          setDirection(-1);
          return prev - 1;
        }
        if (prev === 0) {
          setDirection(1);
          return prev + 1;
        }
        return prev + direction;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <>
      {/* Tour Guide */}
      <Joyride
        steps={homePageSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#f97316', // orange-500
            zIndex: 10000
          },
          tooltip: {
            borderRadius: 12,
            padding: 20
          },
          buttonNext: {
            backgroundColor: '#f97316',
            borderRadius: 8,
            padding: '8px 16px'
          },
          buttonSkip: {
            color: '#6b7280'
          }
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn thành',
          next: 'Tiếp theo',
          skip: 'Bỏ qua'
        }}
      />

      <div className="min-h-screen bg-gray-200/50">
        <main className="mx-auto w-[95%]">
          {/* HERO SECTION - AUTO TRANSLATE SLIDER */}
          <div className="hero-section relative mb-12 overflow-hidden rounded-3xl">
            <div className="relative w-full overflow-hidden">
              <motion.div
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="flex w-full"
              >
                {/* Slide 1 */}
                <div
                  className={`flex w-full flex-shrink-0 items-center bg-gradient-to-br ${heroSlides[currentSlide].gradient} p-12 text-white`}
                >
                  <div>
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="mb-6 text-lg text-purple-100">
                      {heroSlides[currentSlide].description}
                    </p>
                  </div>
                </div>

                {/* Slide 2 */}
                <div
                  className={`flex w-full flex-shrink-0 items-center bg-gradient-to-br ${heroSlides[currentSlide].gradient} p-12 text-white`}
                >
                  <div>
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="mb-6 text-lg text-blue-100">
                      {heroSlides[currentSlide].description}
                    </p>
                  </div>
                </div>

                {/* Slide 3 */}
                <div
                  className={`flex w-full flex-shrink-0 items-center bg-gradient-to-br ${heroSlides[currentSlide].gradient} p-12 text-white`}
                >
                  <div>
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                      {heroSlides[currentSlide].title}
                    </h1>
                    <p className="mb-6 text-lg text-pink-100">
                      {heroSlides[currentSlide].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="categories-section px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 flex items-center text-3xl font-bold text-gray-900">
                    Khám phá khóa học{' '}
                    <Badge className="ml-2 bg-orange-500 text-white">MỚI</Badge>
                  </h2>
                  <p className="text-gray-600">
                    Chọn danh mục phù hợp với mục tiêu của bạn
                  </p>
                </div>

                {/* Course Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Lọc theo:
                  </span>
                  <Select
                    value={courseTypeFilter.toString()}
                    onValueChange={(value) =>
                      setCourseTypeFilter(
                        value === 'ALL'
                          ? 'ALL'
                          : (parseInt(value) as CourseType)
                      )
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn loại khóa học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả</SelectItem>
                      <SelectItem value={CourseType.AS_LEVEL.toString()}>
                        AS Level
                      </SelectItem>
                      <SelectItem value={CourseType.A2_LEVEL.toString()}>
                        A2 Level
                      </SelectItem>
                      <SelectItem value={CourseType.BOTH.toString()}>
                        Cả hai
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                {categories.map((category: any, catIdx: number) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: catIdx * 0.1, duration: 0.5 }}
                  >
                    {/* Category Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-xs flex h-12 w-12 items-center justify-center bg-blue-100 text-2xl">
                          📖
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.courses?.length || 0} khóa học
                          </p>
                        </div>
                      </div>

                      {category.courses?.length > 0 && (
                        <Button
                          variant="ghost"
                          className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        >
                          Xem tất cả
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Courses Grid */}
                    {category.courses && category.courses.length > 0 ? (
                      <div className="scrollbar-hide overflow-x-auto pb-4">
                        <div
                          className="flex gap-6"
                          style={{ width: 'max-content' }}
                        >
                          {category.courses.map((course: any) => (
                            <motion.div
                              key={course.id}
                              whileHover={{ y: -4 }}
                              transition={{ duration: 0.2 }}
                              onClick={() =>
                                router.push(`/course/${course.id}`)
                              }
                            >
                              <Card className="course-card group w-80 cursor-pointer overflow-hidden border-gray-200 bg-white transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
                                {/* Course Image */}
                                <div className="relative h-44 overflow-hidden bg-gray-100">
                                  {course.imageUrl ? (
                                    <img
                                      src={course.imageUrl}
                                      alt={course.title}
                                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <span className="text-6xl">🎓</span>
                                    </div>
                                  )}
                                </div>

                                <CardContent className="p-5">
                                  {/* Course Title */}
                                  <h4 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                                    {course.title}
                                  </h4>

                                  {/* Course Description */}
                                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                    {course.description}
                                  </p>

                                  {/* Course Type and Difficulty */}
                                  <div className="mb-4 flex items-center gap-3">
                                    {course.courseType && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          course.courseType ===
                                          CourseType.AS_LEVEL
                                            ? 'border-blue-500 text-blue-700'
                                            : course.courseType ===
                                                CourseType.A2_LEVEL
                                              ? 'border-green-500 text-green-700'
                                              : 'border-purple-500 text-purple-700'
                                        }
                                      >
                                        {course.courseType ===
                                        CourseType.AS_LEVEL
                                          ? 'AS Level'
                                          : course.courseType ===
                                              CourseType.A2_LEVEL
                                            ? 'A2 Level'
                                            : 'Cả hai'}
                                      </Badge>
                                    )}
                                    {course.difficulty && (
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <span className="font-medium">
                                          Độ khó:
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                          {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                              <Star
                                                key={index}
                                                className={`h-4 w-4 ${
                                                  index < course.difficulty
                                                    ? 'fill-orange-500 text-orange-500'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Nút Xem ngay */}
                                  <div className="border-t border-gray-200 pt-4">
                                    <Button
                                      className="w-full bg-orange-500 text-white hover:bg-orange-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/course/${course.id}`);
                                      }}
                                    >
                                      Xem ngay
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                        <div className="mb-3 text-5xl opacity-50">📭</div>
                        <p className="text-gray-600">
                          Chưa có khóa học nào trong danh mục này
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
