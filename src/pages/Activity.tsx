import React from 'react';
import { useActivityFeed, type ActivityEvent as ActivityEventType } from '@/hooks/useActivityFeed';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, FilePlus, MessageSquarePlus, UserPlus, Edit } from 'lucide-react';

// 1. ActivityEvent Component
const ActivityEvent = ({ event }: { event: ActivityEventType }) => {
  const { user, type, metadata, created_at, task_id } = event;
  
  const renderContent = () => {
    const userName = <span className="font-semibold">{user?.full_name || 'A user'}</span>;
    const taskLink = task_id ? <Link to={`/tasks/${task_id}`} className="font-semibold text-primary hover:underline">{metadata.title || metadata.task_title || 'a task'}</Link> : 'a task';

    switch (type) {
      case 'task.created':
        return <><FilePlus className="h-4 w-4" /> <p>{userName} created a new task: {taskLink}.</p></>;
      case 'task.status.changed':
        return <><Edit className="h-4 w-4" /> <p>{userName} updated {taskLink} from <span className="font-mono text-xs bg-muted p-1 rounded">{metadata.old_status}</span> to <span className="font-mono text-xs bg-muted p-1 rounded">{metadata.new_status}</span>.</p></>;
      case 'comment.created':
        return <><MessageSquarePlus className="h-4 w-4" /> <p>{userName} commented on {taskLink}: <em className="text-muted-foreground">"{metadata.comment_preview}..."</em></p></>;
      case 'team.member.added': // We will need a trigger for this
        return <><UserPlus className="h-4 w-4" /> <p>{userName} added a new member to the team.</p></>;
      default:
        return <><Terminal className="h-4 w-4" /> <p>{userName} performed an action: {type}</p></>;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-9 w-9 mt-1">
        <AvatarImage src={user?.avatar_url} />
        <AvatarFallback>{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">{renderContent()}</div>
        <p className="text-xs text-muted-foreground ml-6">
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};


// 2. ActivityPage Component
const ActivityPage = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useActivityFeed();

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not fetch the activity feed. Please try again later.</AlertDescription>
      </Alert>
    );
  }
  
  const allEvents = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Activity Feed</h1>
      
      {allEvents.length > 0 ? (
        <div className="space-y-6">
          {allEvents.map((event) => <ActivityEvent key={event.id} event={event} />)}
        </div>
      ) : (
        <p>No activity to display yet.</p>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityPage; 