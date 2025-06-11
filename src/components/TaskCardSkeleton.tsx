import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TaskCardSkeleton = () => {
  return (
    <Card className="p-4 bg-card/60 border">
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Card>
  );
};

export default TaskCardSkeleton; 