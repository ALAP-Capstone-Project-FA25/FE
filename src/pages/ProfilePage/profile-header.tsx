'use client';

import { useMemo } from 'react';
import { calculateLoginStats } from './utils';

interface Profile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  phone?: string;
  loginHistories?: any[];
}

interface ProfileHeaderProps {
  profile: Profile | undefined;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.username
    : 'Người dùng';
  const username = profile?.username || '';
  const email = profile?.email || '';
  const avatar =
    profile?.avatar ||
    'https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_se_enriched&w=740&q=80';

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Tham gia gần đây';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `Tham gia từ ${diffYears} năm trước`;
    } else if (diffMonths > 0) {
      return `Tham gia từ ${diffMonths} tháng trước`;
    } else if (diffDays > 0) {
      return `Tham gia từ ${diffDays} ngày trước`;
    }
    return 'Tham gia gần đây';
  };

  const joinDateText = profile?.createdAt
    ? formatJoinDate(profile.createdAt)
    : 'Tham gia gần đây';

  const stats = useMemo(
    () => calculateLoginStats(profile?.loginHistories),
    [profile?.loginHistories]
  );

  return (
    <div className="rounded-lg  ">
      <div className="mx-auto w-full rounded-lg px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Left Section - 30%: Avatar & User Info */}
          <div className="flex flex-col">
            {/* Avatar */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <img
                  src={avatar}
                  alt={fullName}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center lg:text-left">
              <h1 className="mb-1 text-3xl font-bold text-gray-900">
                {fullName}
              </h1>
              <p className="mb-2 text-base text-gray-600">@{username}</p>
              {email && <p className="mb-4 text-sm text-gray-500">{email}</p>}

              <div className="mb-6">
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 lg:justify-start">
                  <span>📅</span>
                  <span>{joinDateText}</span>
                </div>
              </div>

              {/* Streak Stats - Compact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <p className="text-xs text-gray-600">Streak hiện tại</p>
                    <p className="text-sm font-bold text-orange-600">
                      {stats.currentStreak} ngày
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="text-xs text-gray-600">Streak dài nhất</p>
                    <p className="text-sm font-bold text-orange-600">
                      {stats.longestStreak} ngày
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-xs text-gray-600">Ngày hoạt động</p>
                    <p className="text-sm font-bold text-orange-600">
                      {stats.activeDays} ngày
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="text-xs text-gray-600">Tổng đăng nhập</p>
                    <p className="text-sm font-bold text-orange-600">
                      {stats.totalLogins} lần
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
