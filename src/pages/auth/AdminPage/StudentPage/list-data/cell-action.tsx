import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/admin/courses/${data.id}/topics`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewDetails}
      className="flex items-center gap-2"
    >
      <Eye className="h-4 w-4" />
      Xem chi tiết
    </Button>
  );
};
