import {
  useGetListMajorByPaging,
  useUpdateUserMajor
} from '@/queries/major.query';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Award,
  Globe,
  Users,
  TrendingUp,
  Star,
  BookMarked,
  Zap,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from '@/routes/hooks';

interface Category {
  name: string;
  majorId: number;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Major {
  name: string;
  description: string;
  categories: Category[];
  id: number;
  createdAt: string;
  updatedAt: string;
}

export default function ALevelLandingPage() {
  const { data: resListMajor } = useGetListMajorByPaging(1, 10, '');
  const listMajor = resListMajor?.listObjects || [];
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmedMajor, setConfirmedMajor] = useState<Major | null>(null);
  const { width, height } = useWindowSize();

  const { mutateAsync: updateUserMajor } = useUpdateUserMajor();
  const router = useRouter();

  const handleMajorClick = (major: Major) => {
    setSelectedMajor(major);
  };

  const closeSidebar = () => {
    setSelectedMajor(null);
  };

  const handleConfirmMajor = async () => {
    if (selectedMajor) {
      setConfirmedMajor(selectedMajor);
      setShowConfetti(true);
      const [err] = await updateUserMajor({
        majorId: selectedMajor.id
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
        return;
      }

      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };
  const handleDiscoverTest = () => {
    console.log('Navigate to major discovery test');
    router.push('/entry-test-list');
  };

  const features = [
    {
      icon: Globe,
      title: 'Chuẩn Quốc Tế',
      description:
        'Được công nhận bởi hàng nghìn trường đại học trên toàn thế giới'
    },
    {
      icon: Users,
      title: 'Học Linh Hoạt',
      description: 'Tự do lựa chọn môn học phù hợp với sở thích và định hướng'
    },
    {
      icon: TrendingUp,
      title: 'Phát Triển Toàn Diện',
      description: 'Rèn luyện tư duy phản biện và kỹ năng nghiên cứu chuyên sâu'
    },
    {
      icon: Star,
      title: 'Ưu Thế Xét Tuyển',
      description: 'Tăng cơ hội trúng tuyển vào các trường đại học hàng đầu'
    }
  ];

  const stats = [
    { number: '100+', label: 'Quốc Gia', icon: Globe },
    { number: '50+', label: 'Môn Học', icon: BookOpen },
    { number: '10,000+', label: 'Trường ĐH', icon: GraduationCap },
    { number: '95%', label: 'Tỷ Lệ Đỗ', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Simplified Background Effects */}
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

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Majors Section */}
        <section className="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {/* Section Header */}
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo/Icon */}
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-2xl">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              </div>

              <h1 className="mb-4 text-5xl font-bold text-white lg:text-6xl">
                Chọn nhóm môn
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
                Lựa chọn nhóm môn phù hợp và bắt đầu hành trình chinh phục kỳ
                thi A-Level
              </p>

              {/* CTA: Test Button */}
              <button
                onClick={handleDiscoverTest}
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-bold text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 hover:from-orange-600 hover:to-orange-700"
              >
                <Sparkles className="h-6 w-6" />
                <span>Chưa biết chọn gì? Làm bài test tìm môn học phù hợp</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Majors Grid */}
            {listMajor.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center backdrop-blur-sm">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                <p className="text-lg text-gray-400">
                  Đang tải thông tin nhóm môn...
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listMajor.slice(0, 6).map((major: Major, index: number) => (
                  <motion.div
                    key={major.id}
                    className="group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/50 hover:bg-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative p-6">
                      {/* Icon & Badge */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                          <BookMarked className="h-6 w-6 text-white" />
                        </div>

                        <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
                          <span className="text-xs font-semibold text-blue-400">
                            {major.categories.length} môn
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-orange-400">
                        {major.name}
                      </h3>

                      {/* Description */}
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-400">
                        {major.description}
                      </p>

                      {/* Categories List */}
                      <div className="mb-4 space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Các môn học:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {major.categories.map((category) => (
                            <div
                              key={category.id}
                              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-gray-300 backdrop-blur-sm transition-colors hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
                            >
                              {category.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleMajorClick(major)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 px-4 py-3 text-sm font-semibold text-orange-400 transition-all hover:from-orange-500/30 hover:to-orange-600/30"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="relative border-t border-white/5 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left: Stats & Brief Info */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-400">
                    Về Chương Trình A-Level
                  </span>
                </div>

                <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
                  Chuẩn Quốc Tế,
                  <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Cơ Hội Toàn Cầu
                  </span>
                </h2>

                <p className="mb-8 text-gray-400">
                  Chương trình A-Level được công nhận rộng rãi bởi các trường
                  đại học hàng đầu thế giới, giúp bạn phát triển tư duy phản
                  biện và kỹ năng học thuật vững chắc.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm transition-transform hover:scale-105"
                    >
                      <div className="mb-2 flex justify-center">
                        <stat.icon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="mb-1 text-xl font-bold text-white">
                        {stat.number}
                      </div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Features Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div
            className="pointer-events-none fixed inset-0"
            style={{ zIndex: 9999 }}
          >
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={300}
              gravity={0.3}
              colors={[
                '#F97316',
                '#EA580C',
                '#C2410C',
                '#FFFFFF',
                '#3B82F6',
                '#60A5FA'
              ]}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {selectedMajor && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Dialog */}
      <AnimatePresence>
        {selectedMajor && (
          <motion.div
            className="fixed left-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl md:w-[520px]"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
          >
            {/* Sidebar Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 shadow-lg">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    {selectedMajor.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-orange-100">
                    <BookMarked className="h-4 w-4" />
                    <span>{selectedMajor.categories.length} môn học</span>
                  </div>
                </div>
                <button
                  onClick={closeSidebar}
                  className="flex-shrink-0 rounded-lg bg-white/10 p-2 text-white/90 transition-all hover:rotate-90 hover:bg-white/20 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Description Section */}
            <div className="flex-shrink-0 border-b border-orange-100 bg-orange-50 px-6 py-5">
              <h4 className="mb-2 text-sm font-semibold text-orange-900">
                Mô tả môn
              </h4>
              <p className="leading-relaxed text-gray-700">
                {selectedMajor.description}
              </p>
            </div>

            {/* Categories List */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex-shrink-0 px-6 pb-3 pt-6">
                <h4 className="mb-1 text-lg font-bold text-gray-900">
                  Các môn học trong môn
                </h4>
                <p className="text-sm text-gray-600">
                  Danh sách tất cả môn học trong môn
                </p>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                <div className="space-y-3">
                  {selectedMajor.categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-orange-300 hover:bg-orange-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                          <span className="text-sm font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-gray-900">
                            {category.name}
                          </h5>
                        </div>
                        <BookOpen className="h-5 w-5 flex-shrink-0 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-6">
              <button
                onClick={handleConfirmMajor}
                className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700"
              >
                <CheckCircle2 className="h-6 w-6" />
                <span>Chọn Nhóm Môn Này</span>
                <ArrowRight className="h-6 w-6" />
              </button>

              <button
                onClick={handleDiscoverTest}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all duration-300 hover:border-orange-400 hover:bg-gray-50 hover:text-orange-600"
              >
                <Sparkles className="h-5 w-5" />
                <span>Làm Bài Test Tìm Môn Học Phù Hợp</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {confirmedMajor && showConfetti && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-3xl bg-white p-12 text-center shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>

              <h2 className="mb-3 text-3xl font-bold text-gray-900">
                🎉 Chúc Mừng!
              </h2>

              <p className="mb-2 text-xl text-gray-700">Bạn đã chọn nhóm môn</p>

              <p className="mb-6 text-2xl font-bold text-orange-600">
                {confirmedMajor.name}
              </p>

              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Zap className="h-5 w-5 text-orange-500" />
                <span>Đang chuyển đến trang khám phá...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
