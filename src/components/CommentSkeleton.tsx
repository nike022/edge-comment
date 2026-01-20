import { FC } from 'react';

export const CommentSkeleton: FC = () => {
  return (
    <div className="w-full border-b border-chat-border/10 bg-chat-hover animate-pulse">
      <div className="flex gap-4 p-4 mx-auto max-w-3xl">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-chat-border/20" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-chat-border/20 rounded" />
            <div className="h-3 w-32 bg-chat-border/20 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-chat-border/20 rounded" />
            <div className="h-4 w-3/4 bg-chat-border/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
