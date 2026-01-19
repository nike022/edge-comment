import { FC, useState } from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  onSubmitComment: (author: string, email: string, content: string) => void;
  isLoading: boolean;
}

export const CommentInput: FC<CommentInputProps> = ({ onSubmitComment, isLoading }) => {
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    onSubmitComment(author, email, content);
    setAuthor('');
    setEmail('');
    setContent('');
  };

  return (
    <div className="border-t border-chat-border/20 bg-chat-bg">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="昵称 *"
            required
            className="flex-1 px-3 py-2 bg-chat-input text-chat-text rounded border border-chat-border/20 focus:outline-none focus:border-purple-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱 (可选)"
            className="flex-1 px-3 py-2 bg-chat-input text-chat-text rounded border border-chat-border/20 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的留言..."
            required
            rows={3}
            className="flex-1 px-3 py-2 bg-chat-input text-chat-text rounded border border-chat-border/20 focus:outline-none focus:border-purple-500 resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !author.trim() || !content.trim()}
            className="px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
