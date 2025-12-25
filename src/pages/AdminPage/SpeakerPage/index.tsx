import { useState } from 'react';
import { Plus, Search, Users, Mail, Phone, MapPin, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BasePages from '@/components/shared/base-pages';
import { useGetSpeakers } from '@/queries/speaker.query';
import { useDebounce } from '@/hooks/debounce';
import CreateSpeakerDialog from './components/CreateSpeakerDialog';
import SpeakerDetailsDialog from './components/SpeakerDetailsDialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SpeakerPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | null>(
    null
  );

  const debouncedKeyword = useDebounce(keyword, 500);
  const { data: speakersData, isLoading } = useGetSpeakers(
    page,
    10,
    debouncedKeyword
  );
  console.log(speakersData);
  const speakers = speakersData?.listObjects || [];
  const totalPages = speakersData?.totalPages || 1;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleViewDetails = (speakerId: number) => {
    setSelectedSpeakerId(speakerId);
    setIsDetailsDialogOpen(true);
  };

  return (
    <BasePages
      className="relative flex-1 space-y-6 overflow-y-auto px-4"
      pageHead="Quản lý Speaker"
      breadcrumbs={[{ title: 'Quản lý Speaker', link: '/admin/speakers' }]}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Speaker</h2>
          <p className="text-gray-600">
            Tạo và quản lý tài khoản cho các speaker
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo Speaker
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng Speaker
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {speakersData?.totalCount || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoạt động</p>
                <p className="text-3xl font-bold text-green-600">
                  {speakers.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tạo hôm nay</p>
                <p className="text-3xl font-bold text-orange-600">
                  {
                    speakers.filter(
                      (s) =>
                        format(new Date(s.createdAt), 'yyyy-MM-dd') ===
                        format(new Date(), 'yyyy-MM-dd')
                    ).length
                  }
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">
            Danh sách Speaker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo email, tên..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Speakers Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : speakers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Chưa có speaker nào
              </h3>
              <p className="mt-2 text-gray-600">
                {keyword
                  ? 'Không tìm thấy speaker phù hợp'
                  : 'Bắt đầu bằng cách tạo speaker đầu tiên'}
              </p>
              {!keyword && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Speaker
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {speakers.map((speaker) => (
                <Card
                  key={speaker.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={speaker.avatar} />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {getInitials(speaker.firstName, speaker.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate font-semibold text-gray-900">
                            {speaker.firstName} {speaker.lastName}
                          </h3>
                          <Badge
                            variant={speaker.isActive ? 'default' : 'secondary'}
                            className={
                              speaker.isActive
                                ? 'bg-green-100 text-green-800'
                                : ''
                            }
                          >
                            {speaker.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-3 w-3" />
                            <span className="truncate">{speaker.email}</span>
                          </div>

                          {speaker.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="mr-2 h-3 w-3" />
                              <span>{speaker.phone}</span>
                            </div>
                          )}

                          {speaker.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="mr-2 h-3 w-3" />
                              <span className="truncate">
                                {speaker.address}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Tạo:{' '}
                            {format(
                              new Date(speaker.createdAt),
                              'dd/MM/yyyy HH:mm',
                              { locale: vi }
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(speaker.id);
                            }}
                            className="h-8 px-2 text-xs hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={
                        page === pageNum
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : ''
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Speaker Dialog */}
      <CreateSpeakerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Speaker Details Dialog */}
      <SpeakerDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        speakerId={selectedSpeakerId}
      />
    </BasePages>
  );
}
