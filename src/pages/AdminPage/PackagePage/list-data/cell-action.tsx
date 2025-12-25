import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useUpdatePackage } from '@/queries/package.query';
import { Package, UpdatePackageDto, PackageType } from '@/types/api.types';
import { Edit, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface CellActionProps {
  data: Package;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const [editDescription, setEditDescription] = useState(data.description || '');
  const [editPackageType, setEditPackageType] = useState<PackageType>(
    data.packageType
  );
  const [editPrice, setEditPrice] = useState(data.price.toString());
  const [editDuration, setEditDuration] = useState(data.duration.toString());
  const [editIsActive, setEditIsActive] = useState(data.isActive);
  const [editIsPopular, setEditIsPopular] = useState(data.isPopular);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Parse features từ JSON string thành array
  const parseFeatures = (featuresString: string): string[] => {
    if (!featuresString || featuresString.trim() === '') {
      return [];
    }
    try {
      const parsed = JSON.parse(featuresString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Reset form khi mở dialog
  useEffect(() => {
    if (showEditDialog) {
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditPackageType(data.packageType);
      setEditPrice(data.price.toString());
      setEditDuration(data.duration.toString());
      setEditIsActive(data.isActive);
      setEditIsPopular(data.isPopular);
      setFeaturesList(parseFeatures(data.features || ''));
      setNewFeature('');
    }
  }, [showEditDialog, data]);

  const handleAddFeature = () => {
    if (newFeature.trim() && !featuresList.includes(newFeature.trim())) {
      setFeaturesList([...featuresList, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: updatePackage, isPending: isUpdating } =
    useUpdatePackage();

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên gói',
        variant: 'destructive'
      });
      return;
    }

    if (!editPrice || Number(editPrice) < 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập giá hợp lệ',
        variant: 'destructive'
      });
      return;
    }

    if (!editDuration || Number(editDuration) < 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập thời hạn hợp lệ',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Convert features array thành JSON string
      const featuresJson = JSON.stringify(featuresList);

      const updateData: UpdatePackageDto = {
        title: editTitle,
        description: editDescription,
        packageType: editPackageType,
        price: Number(editPrice),
        duration: Number(editDuration),
        isActive: editIsActive,
        isPopular: editIsPopular,
        features: featuresJson
      };

      const [err] = await updatePackage({
        id: data.id,
        data: updateData
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể cập nhật gói',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Gói đã được cập nhật',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
        setShowEditDialog(false);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa gói</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tên gói *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Tên gói..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Mô tả gói..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-package-type">Loại gói *</Label>
                <Select
                  value={editPackageType.toString()}
                  onValueChange={(value) =>
                    setEditPackageType(Number(value) as PackageType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại gói..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">STARTER</SelectItem>
                    <SelectItem value="1">PREMIUM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Thời hạn (ngày) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Giá (VNĐ) *</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="99000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-features">Tính năng</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-features"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tính năng và nhấn Enter hoặc click Thêm"
                />
                <Button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {featuresList.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-md border p-3 min-h-[60px]">
                  {featuresList.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="ml-1 rounded-full hover:bg-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {featuresList.length === 0 && (
                <p className="text-xs text-gray-500">
                  Chưa có tính năng nào. Nhập tính năng và nhấn Enter hoặc click
                  Thêm để thêm vào danh sách.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-is-active">Trạng thái hoạt động</Label>
                  <p className="text-sm text-gray-500">
                    Bật/tắt gói này trên hệ thống
                  </p>
                </div>
                <Switch
                  id="edit-is-active"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
              </div>
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-is-popular">Đánh dấu phổ biến</Label>
                  <p className="text-sm text-gray-500">
                    Hiển thị gói này là phổ biến
                  </p>
                </div>
                <Switch
                  id="edit-is-popular"
                  checked={editIsPopular}
                  onCheckedChange={setEditIsPopular}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

