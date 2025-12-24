'use client';

import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuyPackage, useGetPackagesByPaging } from '@/queries/package.query';
import { toast } from '@/components/ui/use-toast';
import { useGetUserPackages } from '@/queries/user-package';

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(n);
}

function parseFeatures(features: string | string[] | undefined): string[] {
  if (Array.isArray(features)) return features;
  if (!features || typeof features !== 'string') return [];
  let arr: string[] = [];
  let replaced: string = '';
  try {
    arr = JSON.parse(features);
    if (Array.isArray(arr)) return arr;
  } catch (err) {
    try {
      replaced = String(features)
        .replace(/'/g, '"')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      arr = JSON.parse(replaced);
      if (Array.isArray(arr)) return arr;
    } catch {
      if (typeof replaced !== 'string' || !replaced)
        replaced = String(features);
      const matches = Array.from(replaced.matchAll(/"([^"]+)"/g));
      arr = matches
        .map((m) => (Array.isArray(m) && m.length > 1 ? m[1] : ''))
        .filter(Boolean);
      if (arr.length === 0 && replaced.includes(',')) {
        arr = replaced
          .split(',')
          .map((s) => s.replace(/^["'\s]+|["'\s]+$/g, ''))
          .filter(Boolean);
      }
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => typeof item === 'string');
}

export default function PricingPage() {
  const [isYearly] = React.useState(false);
  const {
    data: resPackages,
    isPending,
    isLoading
  } = useGetPackagesByPaging(1, 10, '');

  const { data: resUserPackages } = useGetUserPackages();

  const [isLoadingPayment, setIsLoadingPayment] = React.useState(false);
  const packages = (resPackages?.listObjects ?? []).filter(
    (p: any) => p?.isActive
  );
  const { mutateAsync: buyPackage } = useBuyPackage();
  const showPackages = packages?.length >= 2 ? packages.slice(0, 2) : [];
  const handleBuyPackage = async (packageId: number) => {
    setIsLoadingPayment(true);
    const [err, data] = await buyPackage(packageId);
    if (err) {
      toast({
        title: 'Lỗi',
        description: err.message,
        variant: 'destructive'
      });
    }
    if (data) {
      window.open(data.paymentUrl, '_blank');
    }
    setIsLoadingPayment(false);
  };
  const getPrice = (monthly: number) => {
    if (!isYearly) return { display: formatVND(monthly), period: '/tháng' };
    const yearly = Math.round(monthly * 12 * 0.8); // -20% khi trả năm
    return { display: formatVND(yearly), period: '/năm' };
  };

  return (
    <main className="mx-auto min-h-screen w-[90%] bg-gradient-to-b from-white to-gray-50">
      <div className="relative">
        {/* subtle background pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.06),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
                Gói học
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Chọn gói phù hợp với mục tiêu & tốc độ học của bạn.
            </p>
          </header>

          {/* Pricing Cards */}
          <section
            aria-label="Các gói học"
            className="grid gap-6 md:grid-cols-2 lg:gap-6"
          >
            {showPackages.length === 0 && (
              <div className="col-span-2 flex justify-center py-16">
                <span className="text-gray-400">Đang tải gói học...</span>
              </div>
            )}
            {showPackages
              // luôn đưa gói hiện tại lên đầu
              .sort((a: any, b: any) => {
                const aCur = resUserPackages?.id === a.id ? -1 : 0;
                const bCur = resUserPackages?.id === b.id ? -1 : 0;
                return aCur - bCur;
              })
              .map((pkg: any) => {
                const isCurrent = resUserPackages?.id === pkg.id;
                const { display, period } = getPrice(pkg.price);

                const isPopular = !!pkg.isPopular;
                const badge = isCurrent
                  ? 'GÓI HIỆN TẠI'
                  : isPopular
                    ? 'PHỔ BIẾN NHẤT'
                    : null;

                // Màu nút
                let buttonColor = isCurrent
                  ? 'bg-emerald-500 hover:bg-emerald-600 cursor-default'
                  : isPopular
                    ? 'bg-purple-500 hover:bg-purple-700'
                    : 'bg-emerald-500 hover:bg-emerald-700';

                // Màu viền
                let borderColor = isCurrent
                  ? 'border-transparent'
                  : isPopular
                    ? 'border-purple-500'
                    : 'border-gray-200';

                // Features parse
                let features = parseFeatures(pkg.features);
                if (!Array.isArray(features)) features = [];

                return (
                  <article
                    key={pkg.id}
                    className={[
                      // layout & base
                      'group relative flex h-full flex-col rounded-3xl bg-white/80 p-1 shadow-sm ring-1 ring-gray-200 backdrop-blur transition duration-300 hover:shadow-lg hover:ring-gray-300',
                      // nhấn mạnh card
                      isCurrent && 'order-[-1] md:-mt-3 md:scale-[1.04]',
                      // popular nhẹ hơn current
                      !isCurrent && isPopular && 'md:-mt-2 md:scale-[1.02]'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {/* Vòng sáng gradient (hover) */}
                    <div
                      className="absolute inset-0 -z-10 rounded-3xl opacity-0 blur-xl transition group-hover:opacity-100"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(124,58,237,0.12))'
                      }}
                      aria-hidden
                    />

                    {/* Khung gradient động để làm nổi bật gói hiện tại */}
                    {isCurrent && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
                        style={{
                          padding: 2
                        }}
                      >
                        <div className="h-full w-full rounded-3xl bg-[conic-gradient(at_30%_30%,#10b981_0deg,#a78bfa_120deg,#10b981_240deg,#a78bfa_360deg)] opacity-80 blur-[6px]" />
                      </div>
                    )}

                    <div
                      className={[
                        'relative flex h-full flex-col rounded-3xl border-2 bg-white p-7 sm:p-8',
                        borderColor,
                        // viền & ring riêng cho gói hiện tại
                        isCurrent &&
                          'shadow-lg shadow-emerald-200/60 ring-2 ring-emerald-400/60'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {/* Badge */}
                      {badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span
                            className={[
                              'inline-block rounded-full px-4 py-1 text-xs font-bold tracking-wide text-white shadow-sm',
                              isCurrent
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                                : 'bg-gradient-to-r from-purple-600 to-purple-500'
                            ].join(' ')}
                          >
                            {badge}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <h3
                        className={[
                          'mb-1 text-xl font-bold',
                          isCurrent ? 'text-emerald-700' : 'text-gray-900'
                        ].join(' ')}
                      >
                        {pkg.title}
                      </h3>
                      <p className="mb-5 text-sm leading-6 text-gray-600">
                        {pkg.description}
                      </p>

                      {/* Price */}
                      <div className="mb-5 flex items-end gap-2">
                        <span
                          className={[
                            'text-4xl font-extrabold tracking-tight',
                            isCurrent ? 'text-emerald-700' : 'text-gray-900'
                          ].join(' ')}
                        >
                          {display}
                        </span>
                        <span className="mb-1 text-sm text-gray-500">
                          {period}
                        </span>
                      </div>

                      {/* CTA copy */}
                      <p className="mb-6 text-sm text-gray-600">
                        Có thể tạm dừng hoặc huỷ bất cứ lúc nào.
                        <br />
                        Hoàn tiền trong 7 ngày nếu không hài lòng.
                      </p>

                      {/* CTA Button */}
                      {isCurrent ? (
                        <Button
                          className={`mb-7 w-full rounded-full font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonColor} focus-visible:ring-emerald-500`}
                          size="lg"
                          aria-label={`Gói hiện tại: ${pkg.title}`}
                          disabled
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Gói hiện tại
                        </Button>
                      ) : (
                        <Button
                          className={`mb-7 w-full rounded-full font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonColor} focus-visible:ring-emerald-500`}
                          size="lg"
                          aria-label={`Bắt đầu với gói ${pkg.title}`}
                          onClick={() => handleBuyPackage(pkg.id)}
                        >
                          {isPending || isLoading || isLoadingPayment ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          ) : (
                            'Mua ngay'
                          )}
                        </Button>
                      )}

                      {/* Divider */}
                      <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                      {/* Features */}
                      <ul className="grid flex-1 grid-cols-1 gap-3">
                        {!Array.isArray(features) || features.length === 0 ? (
                          <li className="text-sm italic text-gray-400">
                            Chưa có thông tin quyền lợi
                          </li>
                        ) : (
                          features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-3"
                            >
                              <span
                                className={[
                                  'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                                  isCurrent ? 'bg-emerald-100' : 'bg-emerald-50'
                                ].join(' ')}
                              >
                                <Check
                                  className={[
                                    'h-4 w-4',
                                    isCurrent
                                      ? 'text-emerald-700'
                                      : 'text-emerald-600'
                                  ].join(' ')}
                                />
                              </span>
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>

                      {/* Nhãn phụ giải thích */}
                      {isCurrent && (
                        <p className="mt-6 text-center text-xs font-medium text-emerald-700">
                          Bạn đang sử dụng gói này
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
          </section>
        </div>
      </div>
    </main>
  );
}
