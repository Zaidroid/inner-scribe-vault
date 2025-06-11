import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, Trash2, Edit, Link } from 'lucide-react';

interface TaskColumnProps {
  column: {
    id: string;
    title: string;
    color: string;
  };
  tasks: any[];
  onDragEnd: (taskId: string, newStatus: string) => void;
  onUpdateTask: (taskId: string, updates: any) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick?: (task: any) => void;
  isLoading: boolean;
}

const TaskColumn = ({ column, tasks, onDragEnd, onUpdateTask, onDeleteTask, onTaskClick, isLoading }: TaskColumnProps) => {
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDragEnd(taskId, column.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`glass-card p-4 min-h-[600px] transition-all duration-200 ${
        draggedOver ? 'ring-2 ring-primary bg-accent/50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="outline" className="ml-auto">
          {tasks.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card 
                  className="p-4 bg-card/60 border hover:bg-card/80 transition-colors cursor-pointer"
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="text-xs capitalize">{task.priority}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Link className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {task.dependencies.length} dependencies
                        </span>
                      </div>
                    )}

                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {task.assignee.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs">{task.assignee}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskColumn;
