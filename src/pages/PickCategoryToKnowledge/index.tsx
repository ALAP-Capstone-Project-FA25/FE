import { useGetCategoriesByPagingByMajor } from '@/queries/category.query';
import { useGetMyInfo } from '@/queries/user.query';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  salePrice: number;
  members: number;
  categoryId: number;
}

interface Category {
  id: number;
  imageUrl: string;
  description: string;
  name: string;
  courses: Course[];
}

export default function PickCategoryToKnowledge() {
  const navigate = useNavigate();
  const { data: infoUser } = useGetMyInfo();
  const majorId = infoUser?.majorId;
  const { data: categoriesData, refetch } = useGetCategoriesByPagingByMajor(
    1,
    50,
    '',
    majorId
  );
  const categories = (categoriesData?.listObjects || []) as Category[];

  useEffect(() => {
    if (majorId != null) {
      refetch();
    }
  }, [majorId, refetch]);

  const handleViewDetail = (categoryId: number) => {
    navigate(`/roadmap/${categoryId}`);
  };

  const handleJoinCommunity = () => {
    // Handle join community action
    window.open('https://www.facebook.com/groups/yourgroup', '_blank');
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Lộ trình học</h1>
        <p className="leading-relaxed text-gray-600">
          Để bắt đầu một cách thuận lợi, bạn nên tập trung vào một lộ trình học.
          Mỗi môn hệ thống sẽ có sẵn 1 lộ trình và khóa học phù hợp cho bạn, bạn
          có thể theo dõi song song để quá trình học diễn ra tốt hơn
        </p>
      </div>

      {/* Learning Paths Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className="border-2 border-gray-100 transition-all duration-300 hover:border-gray-200 hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Icon Circle */}
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-orange-500 bg-orange-50">
                    <img
                      src={category?.imageUrl}
                      alt={category?.name}
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                            <svg class="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                          `;
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    Lộ trình học {category.name}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">
                    {/* {getCategoryDescription(category.name)} */}
                    {category.description}
                  </p>
                  <Button
                    onClick={() => handleViewDetail(category.id)}
                    className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    XEM CHI TIẾT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Section */}
      <div className="flex items-start gap-8 ">
        {/* Left Content */}
        <div className="flex-1">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Tham gia cộng đồng học viên AP
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-600">
            Hàng nghìn người khác đang học lộ trình giống như bạn. Hãy tham gia
            hỏi đáp, chia sẻ và hỗ trợ nhau trong quá trình học nhé.
          </p>
          <Button
            onClick={handleJoinCommunity}
            variant="outline"
            className="rounded-full border-2 border-gray-300 px-6 py-2 text-sm font-medium hover:border-gray-400"
          >
            Tham gia nhóm
          </Button>
        </div>

        {/* Right Illustration */}
        <div className="hidden flex-shrink-0 lg:block">
          <div className="relative h-64 w-80">
            {/* Placeholder for illustration - you can replace with actual image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-full w-full text-gray-200"
                viewBox="0 0 400 300"
                fill="none"
              >
                {/* Decorative illustration elements */}
                <circle
                  cx="100"
                  cy="80"
                  r="40"
                  fill="#FFF7ED"
                  stroke="#FB923C"
                  strokeWidth="2"
                />
                <rect
                  x="60"
                  y="150"
                  width="80"
                  height="100"
                  rx="8"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
                <circle
                  cx="300"
                  cy="100"
                  r="50"
                  fill="#DBEAFE"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <path
                  d="M250 180 L350 180 L350 250 L250 250 Z"
                  fill="#FCE7F3"
                  stroke="#EC4899"
                  strokeWidth="2"
                />

                {/* Icon elements */}
                <path
                  d="M90 70 L110 70 M100 60 L100 90"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="180" r="4" fill="#F59E0B" />
                <circle cx="110" cy="180" r="4" fill="#F59E0B" />
                <path
                  d="M85 200 Q100 210 115 200"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
