
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, Link, X } from 'lucide-react';

interface TaskEditModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: any) => void;
  allTasks: any[];
}

const TaskEditModal = ({ task, isOpen, onClose, onSave, allTasks }: TaskEditModalProps) => {
  const [editedTask, setEditedTask] = useState(task || {});
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setDependencies(task.dependencies || []);
    } else {
      setEditedTask({});
      setDependencies([]);
    }
  }, [task]);

  const handleSave = () => {
    if (!task?.id) return;
    
    onSave(task.id, {
      ...editedTask,
      dependencies
    });
    onClose();
  };

  const addDependency = (taskId: string) => {
    if (!dependencies.includes(taskId)) {
      setDependencies([...dependencies, taskId]);
    }
  };

  const removeDependency = (taskId: string) => {
    setDependencies(dependencies.filter(id => id !== taskId));
  };

  const availableTasks = allTasks.filter(t => 
    t.id !== task?.id && 
    t.status !== 'done' && 
    !dependencies.includes(t.id)
  );

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editedTask.status || 'todo'} onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={editedTask.priority || 'medium'} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editedTask.dueDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={editedTask.assignee || ''}
                onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                placeholder="Assignee name"
              />
            </div>
          </div>

          {/* Dependencies Section */}
          <div>
            <Label className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Dependencies
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Select tasks that must be completed before this task can be moved to "Done"
            </p>
            
            {dependencies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {dependencies.map(depId => {
                  const depTask = allTasks.find(t => t.id === depId);
                  return depTask ? (
                    <Badge key={depId} variant="outline" className="flex items-center gap-1">
                      {depTask.title}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeDependency(depId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <Select onValueChange={addDependency}>
              <SelectTrigger>
                <SelectValue placeholder="Add dependency..." />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(availableTask => (
                  <SelectItem key={availableTask.id} value={availableTask.id}>
                    {availableTask.title} ({availableTask.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditModal;
