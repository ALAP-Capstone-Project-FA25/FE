import { useGetAllActiveEntryTests } from '@/queries/entryTest.query';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  Award,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function EntryTestList() {
  const { data: testsData, isPending } = useGetAllActiveEntryTests();
  const navigate = useNavigate();
  console.log(testsData);
  const tests = testsData || [];

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-400">
            Đang tải danh sách bài test...
          </p>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
        {/* Background Effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute h-[800px] w-[800px] rounded-full bg-orange-500/10 blur-3xl"
            style={{ top: '-20%', left: '-10%' }}
          />
          <div
            className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl"
            style={{ bottom: '-15%', right: '-10%' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-2xl">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">
            Chưa có bài test nào
          </h2>
          <p className="mb-6 text-gray-400">
            Hiện tại chưa có bài test đầu vào nào đang hoạt động. Vui lòng quay
            lại sau.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-orange-600 hover:to-orange-700"
          >
            Quay về trang chủ
          </Button>
        </motion.div>
      </div>
    );
  }

  const features = [
    {
      icon: Target,
      title: 'Tìm Ngành Phù Hợp',
      description: 'Khám phá môn học và ngành nghề phù hợp với bạn'
    },
    {
      icon: Clock,
      title: 'Nhanh Chóng',
      description: 'Hoàn thành trong vài phút và nhận kết quả ngay'
    },
    {
      icon: TrendingUp,
      title: 'Độ Chính Xác Cao',
      description: 'Dựa trên phân tích khoa học và dữ liệu thực tế'
    },
    {
      icon: Award,
      title: 'Hoàn Toàn Miễn Phí',
      description: 'Không mất phí, làm lại nhiều lần nếu muốn'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute h-[800px] w-[800px] rounded-full bg-orange-500/10 blur-3xl"
          style={{ top: '-20%', left: '-10%' }}
        />
        <div
          className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl"
          style={{ bottom: '-15%', right: '-10%' }}
        />
      </div>

      <div className="relative z-10 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => navigate('/pick-major')}
              className="group flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm hover:border-orange-500/50 hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Quay lại chọn nhóm môn
            </Button>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
              Bài Test Đầu Vào
            </h1>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">
                {tests.length} bài test đang hoạt động
              </span>
            </div>
          </motion.div>

          {/* Tests Grid */}
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/entry-test/${test.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/50 hover:bg-white/10"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {test.isActive && (
                          <Badge className="border-green-500/30 bg-green-500/10 text-green-400">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Đang hoạt động
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-orange-400">
                        {test.title}
                      </h3>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-400">
                    {test.description}
                  </p>

                  {/* Stats */}
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                      <div className="mb-1 flex justify-center">
                        <Target className="h-4 w-4 text-orange-400" />
                      </div>
                      <div className="text-xs text-gray-400">Độ chính xác</div>
                      <div className="text-sm font-bold text-white">95%</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                      <div className="mb-1 flex justify-center">
                        <Clock className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-xs text-gray-400">Thời gian</div>
                      <div className="text-sm font-bold text-white">
                        ~10 phút
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                      <div className="mb-1 flex justify-center">
                        <Zap className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="text-xs text-gray-400">Kết quả</div>
                      <div className="text-sm font-bold text-white">
                        Ngay lập tức
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="group/btn w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700">
                    <span>Bắt đầu làm bài</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
          >
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">
                  Tại sao nên làm test?
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Khám Phá Bản Thân,
                <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Tìm Đúng Hướng Đi
                </span>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-transform hover:scale-[1.03]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-3 inline-flex rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 shadow-lg">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>

                    <h3 className="mb-2 font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="mb-4 text-sm text-gray-400">
              Chưa chắc chắn ngành nào phù hợp? Hãy thử làm bài test!
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">
                Hoàn toàn miễn phí • Không giới hạn số lần làm
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
