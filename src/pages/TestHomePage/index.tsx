import { Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data based on your API response
const mockCategories = [
  {
    name: 'string',
    courses: [
      {
        title: '123',
        description: '123',
        price: 213,
        imageUrl: '',
        salePrice: 123,
        members: 0,
        categoryId: 2,
        topics: [],
        id: 2,
        createdAt: '2025-10-23T18:57:43.96398',
        updatedAt: '0001-01-01T00:00:00'
      }
    ],
    id: 2,
    createdAt: '2025-10-23T18:44:27.58475',
    updatedAt: '0001-01-01T00:00:00'
  },
  {
    name: 'New',
    courses: [
      {
        title: '123',
        description: '123',
        price: 123,
        imageUrl: '',
        salePrice: 123,
        members: 0,
        categoryId: 3,
        topics: [],
        id: 3,
        createdAt: '2025-10-23T19:22:04.805441',
        updatedAt: '0001-01-01T00:00:00'
      },
      {
        title: '123123',
        description: '123',
        price: 123,
        imageUrl:
          'https://localhost:7247/uploads/92986119-1301-49a9-b757-a399eca96489_TINH HOA DI SAN LDP (1).webp',
        salePrice: 123,
        members: 0,
        categoryId: 3,
        topics: [],
        id: 4,
        createdAt: '2025-10-24T01:14:30.607425',
        updatedAt: '0001-01-01T00:00:00'
      }
    ],
    id: 3,
    createdAt: '2025-10-23T18:49:15.145108',
    updatedAt: '0001-01-01T00:00:00'
  },
  {
    name: '123',
    courses: [],
    id: 4,
    createdAt: '2025-10-23T18:55:31.417289',
    updatedAt: '0001-01-01T00:00:00'
  }
];

export default function TestHomePage() {
  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Helper function to get gradient based on category
  const getGradient = (categoryId: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-yellow-400 to-orange-500',
      'from-pink-500 to-pink-400',
      'from-green-500 to-teal-600',
      'from-red-500 to-pink-600',
      'from-indigo-500 to-blue-600'
    ];
    return gradients[categoryId % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="ml-20 p-8">
        {/* Hero Banner */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12">
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-4 flex items-center gap-2 text-4xl font-bold text-white">
              Mở bán khóa JavaScript Pro
              <Crown className="h-8 w-8 text-yellow-300" />
            </h1>
            <p className="mb-8 text-lg text-white/90">
              Từ 08/08/2024 khóa học sẽ có giá 1.399k. Khi khóa học hoàn thiện
              sẽ trở về giá gốc.
            </p>
            <Button className="rounded-full bg-white px-8 py-6 text-base font-semibold text-purple-600 hover:bg-gray-100">
              HỌC THỬ MIỄN PHÍ
            </Button>
          </div>

          <div className="absolute right-16 top-1/2 -translate-y-1/2 animate-bounce text-center text-white">
            <div className="mb-2 text-5xl font-bold">1.399K</div>
            <div className="mb-2 text-2xl line-through opacity-70">3.299K</div>
            <div className="text-sm opacity-90">
              *Dành cho ai khoản đã pre-order
              <br />
              khóa HTML, CSS Pro
            </div>
          </div>
        </div>

        {/* Categories and Courses Section */}
        <div className="mb-8">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">
              Khóa học theo danh mục
            </h2>
            <Badge className="bg-blue-500 text-white hover:bg-blue-600">
              MỚI
            </Badge>
          </div>

          {mockCategories.map((category: any) => (
            <div key={category.id} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-800">
                  {category.name}
                </h3>
                <Badge variant="outline" className="text-gray-600">
                  {category.courses?.length || 0} khóa học
                </Badge>
              </div>

              {category.courses && category.courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <div
                    className="flex gap-6 pb-4"
                    style={{ width: 'max-content' }}
                  >
                    {category.courses.map((course: any) => (
                      <Card
                        key={course.id}
                        className="w-80 flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                      >
                        <div
                          className={`h-60 bg-gradient-to-br ${getGradient(course.categoryId)} relative flex flex-col items-center justify-center p-8`}
                        >
                          {course.imageUrl ? (
                            <img
                              src={course.imageUrl}
                              alt={course.title}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <>
                              <div className="absolute left-4 top-4 rounded-lg bg-white/30 px-3 py-2 text-2xl backdrop-blur-sm">
                                👑
                              </div>
                              <h3 className="mb-2 text-center text-3xl font-bold text-white drop-shadow-lg">
                                {course.title}
                              </h3>
                            </>
                          )}
                        </div>

                        <CardContent className="p-6">
                          <h4
                            className="mb-2 overflow-hidden text-lg font-semibold text-gray-800"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {course.title}
                          </h4>
                          <p
                            className="mb-4 overflow-hidden text-sm text-gray-600"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {course.description}
                          </p>

                          <div className="mb-4 flex items-center gap-3">
                            {course.salePrice &&
                            course.salePrice < course.price ? (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(course.price)}
                                </span>
                                <span className="text-xl font-bold text-orange-500">
                                  {formatPrice(course.salePrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-orange-500">
                                {formatPrice(course.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>👤</span>
                              <span>{course.members || 0} học viên</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📚</span>
                              <span>{course.topics?.length || 0} bài học</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-500">
                    Chưa có khóa học nào trong danh mục này
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
