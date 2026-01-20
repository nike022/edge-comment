import { FC } from 'react';
import { MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';

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
      <div className="max-w-3xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-chat-input rounded-lg p-4 flex items-center gap-3">
            <div className="bg-purple-600/20 p-3 rounded-lg">
              <MessageSquare className="text-purple-400" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-chat-text">{stats.totalComments}</div>
              <div className="text-sm text-chat-text-secondary">总评论数</div>
            </div>
          </div>

          <div className="bg-chat-input rounded-lg p-4 flex items-center gap-3">
            <div className="bg-pink-600/20 p-3 rounded-lg">
              <ThumbsUp className="text-pink-400" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-chat-text">{stats.totalLikes}</div>
              <div className="text-sm text-chat-text-secondary">总点赞数</div>
            </div>
          </div>

          <div className="bg-chat-input rounded-lg p-4 flex items-center gap-3">
            <div className="bg-blue-600/20 p-3 rounded-lg">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              {stats.mostLikedComment ? (
                <>
                  <div className="text-2xl font-bold text-chat-text">{stats.mostLikedComment.likes}</div>
                  <div className="text-sm text-chat-text-secondary truncate">
                    最热评论: {stats.mostLikedComment.author}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-chat-text">0</div>
                  <div className="text-sm text-chat-text-secondary">暂无热门评论</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
