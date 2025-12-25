import { useParams } from 'react-router-dom';
import { useRouter } from '@/routes/hooks';
import { useGetBlogPostById, useLikeBlogPost } from '@/queries/blog.query';
import { BlogPostTargetAudience } from '@/types/api.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  ArrowLeft,
  Calendar,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import BlogPostSections from '@/components/blog/BlogPostSections';
import BlogCommentSection from '@/components/blog/BlogCommentSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import __helpers from '@/helpers';
import { useGetMyInfo } from '@/queries/user.query';
import { useState } from 'react';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, refetch } = useGetBlogPostById(Number(id));
  const { data: currentUser } = useGetMyInfo();
  const likeMutation = useLikeBlogPost();
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  // Data is already unwrapped by useGetBlogPostById
  const post = data;
  const isAuthenticated = !!__helpers.cookie_get('AT');

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    try {
      await likeMutation.mutateAsync(Number(id));
      refetch();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const isLiked = post?.likes?.some((like) => like.userId === currentUser?.id);
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;
  const tags = parseTags(post?.tags);

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">Không tìm thấy bài viết.</p>
      </div>
    );
  }

  const sortedSections = post.sections
    ? [...post.sections].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  const scrollToSection = (orderIndex: number) => {
    const element = document.getElementById(`section-${orderIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/blog')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="mx-auto flex max-w-6xl gap-8">
        {/* Left Sidebar - Author, Like, Comment */}
        <aside className="sticky top-20 hidden h-fit w-20 flex-shrink-0 flex-col items-center gap-6 lg:flex">
          {post.author && (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>
                  {post.author.firstName?.[0] || post.author.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-center text-xs font-medium text-gray-700">
                {post.author.firstName} {post.author.lastName}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="flex flex-col items-center gap-1 transition-colors hover:opacity-80 disabled:opacity-50"
            >
              <Heart
                className={`h-6 w-6 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
              <span className="text-xs font-medium text-gray-600">
                {likeCount}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setCommentSheetOpen(true)}
              className="flex flex-col items-center gap-1 transition-colors hover:opacity-80"
            >
              <MessageCircle className="h-6 w-6 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">
                {commentCount}
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
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
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              {post.title}
            </h1>

            <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(post.createdAt), 'dd/MM/yyyy', {
                    locale: vi
                  })}
                </span>
              </div>
            </div>

            {post.imageUrl && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Content Sections */}
          {post.sections && post.sections.length > 0 ? (
            <BlogPostSections sections={post.sections} />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <p className="text-gray-600">Bài viết chưa có nội dung.</p>
            </div>
          )}
        </article>

        {/* Navigation Menu - Right Side */}
        {sortedSections.length > 0 && (
          <aside className="sticky top-20 hidden h-fit w-64 flex-shrink-0 lg:block">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase text-gray-700">
                Mục lục
              </h3>
              <nav className="space-y-2">
                {sortedSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.orderIndex)}
                    className="block w-full text-left text-sm text-gray-600 transition-colors hover:text-gray-900 hover:underline"
                  >
                    {index + 1}. {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* Comment Sheet */}
      <Sheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col overflow-hidden sm:max-w-2xl"
        >
          <div className="flex-1 overflow-y-auto">
            <BlogCommentSection
              comments={post.comments || []}
              blogPostId={post.id}
              onCommentAdded={() => {
                refetch();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
