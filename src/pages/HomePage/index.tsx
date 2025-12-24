import { Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCategoriesByPaging } from '@/queries/category.query';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/routes/hooks';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      type: 'spring',
      stiffness: 125,
      damping: 18
    }
  })
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, type: 'spring', damping: 19, stiffness: 120 }
  }
};

export default function F8LearningPlatform() {
  const { data: categoriesData } = useGetCategoriesByPaging(1, 10, '');
  const categories = categoriesData?.listObjects || [];

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

  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="ml-20 p-8">
        {/* Hero Banner */}
        <motion.div
          className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12"
          initial="hidden"
          animate="visible"
        >
          <div className="relative z-10">
            <motion.h1
              initial="hidden"
              animate="visible"
              className="mb-4 flex items-center gap-2 text-4xl font-bold text-white"
            >
              Mở bán khóa ôn luyện AP
              <Crown className="h-8 w-8 text-yellow-300" />
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mb-8 text-lg text-white/90"
            >
              AP Learning là nền tảng học lập trình và phát triển kỹ năng số
              dành cho tất cả mọi người. Với các khóa học đa dạng, bài giảng
              chất lượng và cộng đồng hỗ trợ nhiệt tình, bạn có thể bắt đầu con
              đường chinh phục công nghệ bất cứ khi nào!
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Button className="rounded-full bg-white px-8 py-6 text-base font-semibold text-purple-600 hover:bg-gray-100">
                HỌC THỬ MIỄN PHÍ
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Categories and Courses Section */}
        <motion.div className="mb-8" initial="hidden" animate="visible">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">
              Khóa học theo danh mục
            </h2>
            <Badge className="bg-blue-500 text-white hover:bg-blue-600">
              MỚI
            </Badge>
          </div>

          <AnimatePresence>
            {categories.map((category: any, catIdx: number) => (
              <motion.div
                key={category.id}
                className="mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: catIdx * 0.09,
                      duration: 0.5,
                      type: 'spring',
                      damping: 20
                    }
                  }
                }}
              >
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
                      <AnimatePresence initial={false}>
                        {category.courses.map((course: any, i: number) => (
                          <motion.div
                            key={course.id}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.94, y: 18 }}
                            whileHover={{
                              y: -6,
                              scale: 1.014
                            }}
                            style={{ display: 'flex' }}
                            onClick={() => router.push(`/course/${course.id}`)}
                          >
                            <Card className="w-80 flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-300">
                              <div
                                className={`h-60 bg-gradient-to-br ${getGradient(course.categoryId)} relative flex flex-col items-center justify-center p-8`}
                              >
                                {course.imageUrl ? (
                                  <motion.img
                                    src={course.imageUrl}
                                    alt={course.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    initial={{ opacity: 0, scale: 1.07 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      duration: 0.75,
                                      delay: 0.1 + i * 0.03
                                    }}
                                  />
                                ) : (
                                  <>
                                    <motion.div
                                      className="absolute left-4 top-4 rounded-lg bg-white/30 px-3 py-2 text-2xl backdrop-blur-sm"
                                      initial={{ opacity: 0, scale: 0.85 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.34 }}
                                    >
                                      👑
                                    </motion.div>
                                    <motion.h3
                                      className="mb-2 text-center text-3xl font-bold text-white drop-shadow-lg"
                                      initial={{ opacity: 0, scale: 1.06 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{
                                        delay: 0.08,
                                        duration: 0.45
                                      }}
                                    >
                                      {course.title}
                                    </motion.h3>
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

                                <motion.div
                                  className="flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.13 }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>👤</span>
                                    <span>{course.members || 0} học viên</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>📚</span>
                                    <span>
                                      {course.topics?.length || 0} bài học
                                    </span>
                                  </div>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <p className="text-gray-500">
                      Chưa có khóa học nào trong danh mục này
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
