import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogPostComment, CreateBlogPostCommentDto } from '@/types/api.types';
import {
  useCreateBlogPostComment,
  useDeleteBlogPostComment
} from '@/queries/blog.query';
import { useGetMyInfo } from '@/queries/user.query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BlogCommentSectionProps {
  comments: BlogPostComment[];
  blogPostId: number;
  onCommentAdded?: () => void;
}

interface CommentItemProps {
  comment: BlogPostComment;
  blogPostId: number;
  currentUserId?: number;
  onDelete: (commentId: number) => void;
  onReply: (parentCommentId: number) => void;
  level?: number;
}

function CommentItem({
  comment,
  blogPostId,
  currentUserId,
  onDelete,
  onReply,
  level = 0
}: CommentItemProps) {
  const maxLevel = 2; // Maximum 2 levels deep
  const isReply = level > 0;

  return (
    <div className={isReply ? 'ml-12 mt-3' : 'mt-4'}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={comment.user?.avatar}
            alt={comment.user?.username}
          />
          <AvatarFallback className="text-xs">
            {comment.user?.firstName?.[0] || comment.user?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="inline-block rounded-2xl bg-muted px-4 py-2">
            <div className="mb-1">
              <span className="text-sm font-semibold">
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>
            </div>
            <div
              className="break-words text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
          <div className="mt-1 flex items-center gap-4 px-2">
            {currentUserId && level < maxLevel && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs font-semibold text-muted-foreground hover:underline"
              >
                Trả lời
              </button>
            )}
            {currentUserId === comment.userId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs font-semibold text-destructive hover:underline"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              blogPostId={blogPostId}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogCommentSection({
  comments,
  blogPostId,
  onCommentAdded
}: BlogCommentSectionProps) {
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { data: currentUser } = useGetMyInfo();
  const createComment = useCreateBlogPostComment();
  const deleteComment = useDeleteBlogPostComment();

  // Filter top-level comments (no parent)
  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung bình luận',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dto: CreateBlogPostCommentDto = {
        blogPostId,
        content: commentContent
      };
      await createComment.mutateAsync(dto);
      setCommentContent('');
      toast({
        title: 'Thành công',
        description: 'Đã thêm bình luận'
      });
      onCommentAdded?.();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể thêm bình luận',
        variant: 'destructive'
      });
    }
  };

  const handleReply = async (parentCommentId: number) => {
    if (!replyContent.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung trả lời',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dto: CreateBlogPostCommentDto = {
        blogPostId,
        content: replyContent,
        parentCommentId
      };
      await createComment.mutateAsync(dto);
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: 'Thành công',
        description: 'Đã trả lời bình luận'
      });
      onCommentAdded?.();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể trả lời bình luận',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await deleteComment.mutateAsync({ commentId, blogPostId });
      toast({
        title: 'Thành công',
        description: 'Đã xóa bình luận'
      });
      onCommentAdded?.();
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể xóa bình luận',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-semibold">Bình luận ({comments.length})</h3>
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {topLevelComments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  blogPostId={blogPostId}
                  currentUserId={currentUser?.id}
                  onDelete={handleDelete}
                  onReply={(parentId) => setReplyingTo(parentId)}
                  level={0}
                />

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-11 mt-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReply(comment.id);
                      }}
                      className="space-y-3"
                    >
                      <Textarea
                        placeholder={`Trả lời ${comment.user?.firstName} ${comment.user?.lastName}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={createComment.isPending}
                          size="sm"
                          className="h-8"
                        >
                          <Send className="mr-2 h-3 w-3" />
                          Gửi
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Form - Fixed at bottom */}
      {currentUser && (
        <div className="border-t bg-background px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="text-xs">
                  {currentUser.firstName?.[0] ||
                    currentUser.username?.[0] ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Viết bình luận..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createComment.isPending || !commentContent.trim()}
                    size="sm"
                    className="h-8"
                  >
                    <Send className="mr-2 h-3 w-3" />
                    {createComment.isPending ? 'Đang gửi...' : 'Gửi'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
