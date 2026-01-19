import { useState, useRef, useEffect, FC } from 'react';
import { CommentMessage } from './CommentMessage';
import { CommentInput } from './CommentInput';
import { Comment } from '../types/comment';

export const CommentBoard: FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  useEffect(() => {
    fetchComments();
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/get-comments');
      const result = await response.json();
      if (result.success) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmitComment = async (author: string, email: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, email, content })
      });

      const result = await response.json();
      if (result.success) {
        await fetchComments();
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
      const response = await fetch('/api/auth', {
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

  return (
    <div className="flex flex-col h-screen bg-chat-bg">
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

      <div className="flex-1 overflow-y-auto chat-scrollbar">
        <div className="pb-4">
          {comments.map((comment) => (
            <CommentMessage
              key={comment.id}
              comment={comment}
              isAdmin={isAuthenticated}
              onDelete={handleDelete}
            />
          ))}
          <div ref={commentsEndRef} />
        </div>
      </div>

      <CommentInput onSubmitComment={handleSubmitComment} isLoading={isLoading} />
    </div>
  );
};
