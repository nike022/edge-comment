export interface Comment {
  id: string;
  content: string;
  author: string;
  email?: string;
  timestamp: Date;
  ip?: string;
}

export interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export interface SubmitCommentParams {
  author: string;
  email?: string;
  content: string;
}
