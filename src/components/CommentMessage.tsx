import { FC } from 'react';
import { User, Trash2 } from 'lucide-react';
import { Comment } from '../types/comment';

interface CommentMessageProps {
  comment: Comment;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export const CommentMessage: FC<CommentMessageProps> = ({ comment, isAdmin, onDelete }) => {
  return (
    <div className="group w-full border-b border-chat-border/10 bg-chat-hover">
      <div className="flex gap-4 p-4 mx-auto max-w-3xl">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-white bg-chat-green">
          <User size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-chat-text font-medium">{comment.author}</span>
            <span className="text-chat-text-secondary text-xs">
              {new Date(comment.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="text-chat-text leading-relaxed">
            {comment.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button
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
