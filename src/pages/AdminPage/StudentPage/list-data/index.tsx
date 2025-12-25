import { useState } from 'react';
import DataTable from '@/components/shared/data-table';
import { columns } from './columns';
import LockUserDialog from '../components/LockUserDialog';

type TTableProps = {
  data: any;
  page: number;
  totalUsers: number;
  pageCount: number;
  bulkActions?: any[];
  onRefresh?: () => void;
};

export default function ListData({
  data,
  pageCount,
  bulkActions,
  onRefresh
}: TTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const handleToggleLock = (user: any) => {
    setSelectedUser(user);
    setIsLockDialogOpen(true);
  };

  const handleLockSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      {data && (
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          showAdd={false}
          heightTable="50dvh"
          placeHolderInputSearch="Tìm kiếm học viên..."
          showSearch={true}
          meta={{
            onToggleLock: handleToggleLock
          }}
        />
      )}
      
      <LockUserDialog
        user={selectedUser}
        isOpen={isLockDialogOpen}
        onClose={() => {
          setIsLockDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleLockSuccess}
      />
    </>
  );
}
