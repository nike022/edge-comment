import { FC } from 'react';

interface StatsData {
  totalComments: number;
  totalLikes: number;
  mostLikedComment: {
    id: string;
    author: string;
    content: string;
    likes: number;
  } | null;
}

interface StatsProps {
  stats: StatsData | null;
  isLoading: boolean;
}

export const StatsPanel: FC<StatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="border-b border-chat-border/20 bg-chat-bg">
        <div className="max-w-3xl mx-auto p-4">
          <div className="animate-pulse flex gap-4">
            <div className="h-20 bg-chat-input rounded flex-1"></div>
            <div className="h-20 bg-chat-input rounded flex-1"></div>
            <div className="h-20 bg-chat-input rounded flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="border-b border-chat-border/20 bg-chat-bg">
      <div className="max-w-3xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-6 text-xs text-chat-text-secondary">
          <span>评论 <span className="font-semibold text-chat-text">{stats.totalComments}</span></span>
          <span>点赞 <span className="font-semibold text-chat-text">{stats.totalLikes}</span></span>
          {stats.mostLikedComment && (
            <span>最热 <span className="font-semibold text-chat-text">{stats.mostLikedComment.likes}</span> 赞</span>
          )}
        </div>
      </div>
    </div>
  );
};
