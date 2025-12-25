import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { USER_ROLE } from '@/constants/data';

export default function TestProfilePage() {
  const infoUser = useSelector((state: RootState) => state.auth.infoUser);

  const getRoleName = (role: number) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return 'Quản trị viên';
      case USER_ROLE.MENTOR:
        return 'Mentor';
      case USER_ROLE.USER:
        return 'Học viên';
      case USER_ROLE.SPEAKER:
        return 'Diễn giả';
      default:
        return 'Người dùng';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Profile Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Thông tin người dùng</h2>
        
        {infoUser ? (
          <div className="space-y-2">
            <p><strong>ID:</strong> {infoUser.id}</p>
            <p><strong>Tên:</strong> {infoUser.fullName || infoUser.userName || 'Chưa cập nhật'}</p>
            <p><strong>Email:</strong> {infoUser.email || 'Chưa cập nhật'}</p>
            <p><strong>Vai trò:</strong> {getRoleName(infoUser.role || USER_ROLE.USER)}</p>
            <p><strong>Số điện thoại:</strong> {infoUser.phone || 'Chưa cập nhật'}</p>
            <p><strong>Địa chỉ:</strong> {infoUser.address || 'Chưa cập nhật'}</p>
            <p><strong>Giới thiệu:</strong> {infoUser.bio || 'Chưa có thông tin'}</p>
          </div>
        ) : (
          <p>Chưa có thông tin người dùng</p>
        )}
        
        <div className="mt-6">
          <a 
            href="/user-profile" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Đi tới trang Profile
          </a>
        </div>
      </div>
    </div>
  );
}