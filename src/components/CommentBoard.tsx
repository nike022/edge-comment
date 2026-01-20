import { useState, useEffect, FC } from 'react';
import { CommentMessage } from './CommentMessage';
import { CommentInput } from './CommentInput';
import { CommentSkeleton } from './CommentSkeleton';
import { Toast } from './Toast';
import { StatsPanel } from './StatsPanel';
import { Comment } from '../types/comment';

type SortType = 'newest' | 'oldest' | 'mostLiked';

export const CommentBoard: FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<SortType>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [currentPage, sortType]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }

    // 加载已点赞的评论
    const liked = localStorage.getItem('liked_comments');
    if (liked) {
      setLikedComments(new Set(JSON.parse(liked)));
    }
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/get-stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchComments = async () => {
    setIsFetchingComments(true);
    try {
      const response = await fetch(`/api/get-comments?page=${currentPage}&sort=${sortType}`);
      const result = await response.json();
      if (result.success) {
        setComments(result.comments);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handleSubmitComment = async (author: string, email: string, content: string) => {
    // 前端频率限制检查
    const lastSubmitTime = localStorage.getItem('last_submit_time');
    if (lastSubmitTime) {
      const timeDiff = Date.now() - parseInt(lastSubmitTime);
      const waitSeconds = Math.ceil((60000 - timeDiff) / 1000);
      if (timeDiff < 60000) {
        alert(`请等待 ${waitSeconds} 秒后再提交`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/submit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, email, content })
      });

      const result = await response.json();
      if (result.success) {
        // 记录提交时间
        localStorage.setItem('last_submit_time', Date.now().toString());

        // 立即添加新评论到本地状态，提供即时反馈
        const newComment: Comment = {
          id: result.commentId,
          author,
          email: email || '',
          content,
          timestamp: new Date(),
          ip: ''
        };
        setComments([newComment, ...comments]);
        setShowToast(true);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/auth-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('auth_token', result.token);
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('密码错误');
      }
    } catch (error) {
      setAuthError('登录失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条留言吗?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/delete-comment?commentId=${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setComments(comments.filter(c => c.id !== commentId));
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleLike = async (id: string) => {
    if (likedComments.has(id)) return;

    try {
      const response = await fetch('/api/like-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id })
      });

      const result = await response.json();
      if (result.success) {
        const newLikedComments = new Set(likedComments);
        newLikedComments.add(id);
        setLikedComments(newLikedComments);
        localStorage.setItem('liked_comments', JSON.stringify([...newLikedComments]));

        setComments(comments.map(c =>
          c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c
        ));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-chat-bg">
      {showToast && <Toast message="留言提交成功！" onClose={() => setShowToast(false)} />}

      <div className="border-b border-chat-border/20 bg-chat-bg">
        <div className="max-w-3xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-chat-text">边缘留言板</h1>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-sm text-chat-text-secondary hover:text-chat-text">
              退出管理
            </button>
          ) : (
            <form onSubmit={handleLogin} className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理员密码"
                className="px-3 py-1 bg-chat-input text-chat-text text-sm rounded"
              />
              <button type="submit" className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                登录
              </button>
            </form>
          )}
        </div>
        {authError && <div className="max-w-3xl mx-auto px-4 pb-2 text-red-400 text-sm">{authError}</div>}
      </div>

      <CommentInput onSubmitComment={handleSubmitComment} isLoading={isLoading} />

      <div className="border-b border-chat-border/20 bg-chat-bg">
        <div className="max-w-3xl mx-auto px-4 py-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSortType('newest')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortType === 'newest' ? 'bg-purple-600 text-white' : 'text-chat-text-secondary hover:bg-chat-hover'
            }`}
          >
            最新
          </button>
          <button
            type="button"
            onClick={() => setSortType('oldest')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortType === 'oldest' ? 'bg-purple-600 text-white' : 'text-chat-text-secondary hover:bg-chat-hover'
            }`}
          >
            最早
          </button>
          <button
            type="button"
            onClick={() => setSortType('mostLiked')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              sortType === 'mostLiked' ? 'bg-purple-600 text-white' : 'text-chat-text-secondary hover:bg-chat-hover'
            }`}
          >
            最多点赞
          </button>
        </div>
      </div>

      <StatsPanel stats={stats} isLoading={isLoadingStats} />

      <div className="pb-4">
        {isFetchingComments ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-chat-text-secondary">
            暂无留言，快来抢沙发吧~
          </div>
        ) : (
          <>
            {comments.map((comment: Comment) => (
              <CommentMessage
                key={comment.id}
                comment={comment}
                isAdmin={isAuthenticated}
                onDelete={handleDelete}
                onLike={handleLike}
                hasLiked={likedComments.has(comment.id)}
              />
            ))}
            {totalPages > 1 && (
              <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-chat-input text-chat-text rounded hover:bg-chat-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-chat-text-secondary">
                  第 {currentPage} / {totalPages} 页
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-chat-input text-chat-text rounded hover:bg-chat-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
