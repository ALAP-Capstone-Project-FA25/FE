'use client';

interface Profile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  phone?: string;
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
  const avatar = profile?.avatar || '/professional-portrait-avatar.png';

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

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              <img
                src={avatar}
                alt={fullName}
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex-1">
            <h1 className="mb-1 text-4xl font-bold text-gray-900">
              {fullName}
            </h1>
            <p className="mb-2 text-lg text-gray-600">@{username}</p>
            {email && <p className="mb-6 text-sm text-gray-500">{email}</p>}

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <span className="flex items-center gap-1">
                  <span>👥</span>
                  <span>0 người theo dõi</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>0 đăng theo dõi</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>📅</span>
                <span>{joinDateText}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700">
                Theo dõi
              </button>
              <button className="rounded-lg border-2 border-gray-300 px-6 py-2 font-medium text-gray-700 transition hover:bg-gray-50">
                Chia sẻ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
