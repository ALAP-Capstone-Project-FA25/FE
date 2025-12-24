import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPost, BlogPostTargetAudience } from '@/types/api.types';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from '@/routes/hooks';

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const router = useRouter();

  const getTargetAudienceLabel = (audience: BlogPostTargetAudience) => {
    switch (audience) {
      case BlogPostTargetAudience.AS_LEVEL:
        return 'AS Level';
      case BlogPostTargetAudience.A2_LEVEL:
        return 'A2 Level';
      case BlogPostTargetAudience.BOTH:
        return 'Cả hai';
      default:
        return '';
    }
  };

  const parseTags = (tagsJson?: string): string[] => {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  };

  const tags = parseTags(post.tags);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  return (
    <Card
      className="group cursor-pointer border border-gray-200 transition-all hover:shadow-lg"
      onClick={() => router.push(`/blog/${post.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left content */}
          <div className="flex-1">
            {/* Author info */}
            {post.author && (
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-semibold text-white shadow-sm">
                  {post.author.firstName?.charAt(0)}
                  {post.author.lastName?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {post.author.firstName} {post.author.lastName}
                </span>
              </div>
            )}

            {/* Target Audience Badge */}
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  post.targetAudience === BlogPostTargetAudience.AS_LEVEL
                    ? 'border-blue-500 text-blue-700'
                    : post.targetAudience === BlogPostTargetAudience.A2_LEVEL
                      ? 'border-green-500 text-green-700'
                      : 'border-purple-500 text-purple-700'
                }
              >
                {getTargetAudienceLabel(post.targetAudience)}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-gray-700">
              {post.title}
            </h3>

            {/* Tags and metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-center gap-2">
                  {tags.slice(0, 2).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-xs text-gray-700"
                    >
                      +{tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(post.createdAt), 'dd/MM/yyyy', {
                    locale: vi
                  })}
                </span>
              </div>

              {/* Interaction stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{commentCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right image */}
          {post.imageUrl && (
            <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
