import React, { useState } from 'react';
import { useComments, type Comment as CommentType } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

// 1. AddCommentForm Component
const AddCommentForm = ({ taskId }: { taskId: string }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  
  const addCommentMutation = useMutation({
    mutationFn: async (newComment: { task_id: string; user_id: string; content: string }) => {
      const { error } = await supabase.from('comments').insert(newComment);
      if (error) throw new Error('Failed to post comment: ' + error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setContent('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    addCommentMutation.mutate({ task_id: taskId, user_id: user.id, content });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4">
      <div className="relative">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="pr-20"
          disabled={addCommentMutation.isPending}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1">
           <Button type="button" variant="ghost" size="icon" disabled={addCommentMutation.isPending}>
             <Paperclip className="h-4 w-4" />
           </Button>
           <Button type="submit" size="icon" disabled={!content.trim() || addCommentMutation.isPending}>
             <Send className="h-4 w-4" />
           </Button>
        </div>
      </div>
    </form>
  );
};


// 2. CommentView Component
const CommentView = ({ comment }: { comment: CommentType }) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user?.avatar_url} />
        <AvatarFallback>{comment.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">{comment.user?.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </p>
        </div>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
};


// 3. CommentsList Component
export const CommentsList = ({ taskId }: { taskId: string }) => {
  const { data: comments, isLoading, error } = useComments(taskId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Could not load comments.</p>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Comments</h3>
      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {comments && comments.length > 0 ? (
          comments.map(comment => <CommentView key={comment.id} comment={comment} />)
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>
      <AddCommentForm taskId={taskId} />
    </div>
  );
}; 