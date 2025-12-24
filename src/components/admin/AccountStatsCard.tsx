import { Users, UserCheck, UserX, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AccountStatsCardProps {
  data: {
    total: number;
    active: number;
    banned: number;
    unverified: number;
  };
  title: string;
  type: 'students' | 'mentors' | 'admins';
}

export default function AccountStatsCard({
  data,
  title,
  type
}: AccountStatsCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'students':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'mentors':
        return <UserCheck className="h-5 w-5 text-green-600" />;
      case 'admins':
        return <UserX className="h-5 w-5 text-purple-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getTypeIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.total.toLocaleString()}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="default" className="text-xs">
            <UserCheck className="mr-1 h-3 w-3" />
            Hoạt động: {data.active}
          </Badge>
          <Badge variant="destructive" className="text-xs">
            <UserX className="mr-1 h-3 w-3" />
            Bị khóa: {data.banned}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Mail className="mr-1 h-3 w-3" />
            Chưa xác thực: {data.unverified}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {((data.active / data.total) * 100).toFixed(1)}% tài khoản hoạt động
        </p>
      </CardContent>
    </Card>
  );
}
