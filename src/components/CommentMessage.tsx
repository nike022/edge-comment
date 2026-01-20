import { FC } from 'react';
import { Trash2, ThumbsUp } from 'lucide-react';
import { Comment } from '../types/comment';
import { formatRelativeTime } from '../utils/formatTime';
import { sanitizeContent } from '../utils/sanitize';
import { getGravatarUrl } from '../utils/gravatar';

interface CommentMessageProps {
  comment: Comment;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  hasLiked: boolean;
}

export const CommentMessage: FC<CommentMessageProps> = ({ comment, isAdmin, onDelete, onLike, hasLiked }) => {
  return (
    <div className="group w-full border-b border-chat-border/10 hover:bg-chat-hover/50 transition-colors">
      <div className="flex gap-4 p-4 mx-auto max-w-3xl">
        <img
          src={getGravatarUrl(comment.email || '', 32)}
          alt={comment.author}
          className="flex-shrink-0 w-8 h-8 rounded-full"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-chat-text font-medium">{comment.author}</span>
            <span className="text-chat-text-secondary text-xs" title={new Date(comment.timestamp).toLocaleString('zh-CN')}>
              {formatRelativeTime(new Date(comment.timestamp))}
            </span>
            {isAdmin && comment.ip && (
              <span className="text-chat-text-secondary text-xs" title="IP地址(仅管理员可见)">
                IP: {comment.ip}
              </span>
            )}
          </div>
          <div className="text-chat-text leading-relaxed">
            {comment.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: sanitizeContent(line) || '\u00A0' }} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onLike(comment.id)}
            className={`mt-2 flex items-center gap-1 text-sm transition-colors ${
              hasLiked ? 'text-purple-500' : 'text-chat-text-secondary hover:text-purple-500'
            }`}
          >
            <ThumbsUp size={14} className={hasLiked ? 'fill-current' : ''} />
            <span>{comment.likes || 0}</span>
          </button>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
            title="删除留言"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
