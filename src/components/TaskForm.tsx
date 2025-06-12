import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Link, X, Save } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { CommentsList } from './Comments';
import { Separator } from './ui/separator';
import { DialogFooter } from '@/components/ui/dialog';
import { RemindersManager } from './RemindersManager';
import { useTaskTemplates } from '@/hooks/useTaskTemplates';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useModalStore } from '@/hooks/useModalStore';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any; // Make task optional for create mode
}

const TaskForm = ({ isOpen, onClose, task }: TaskFormProps) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTemplate } = useTaskTemplates();
  const [templateName, setTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const { addTask, updateTask } = useSupabaseTasks();
  
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { tasks: allTasks } = useSupabaseTasks();
  const { user } = useAuth();
  
  const isEditMode = !!task;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          ...task,
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        });
      } else {
        // Reset for create mode
        setFormData({
          title: task?.title || '',
          description: task?.description || '',
          status: 'todo',
          priority: 'medium',
          due_date: '',
          assignee: user?.id || '',
          dependencies: [],
        });
      }
    }
  }, [isOpen, task, isEditMode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        due_date: formData.due_date || null,
        assignee: formData.assignee || null,
      };
      if (isEditMode) {
        await updateTask(task.id, submissionData);
      } else {
        await addTask(submissionData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to submit task", error);
      toast({ title: 'Error', description: 'Failed to save task.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'assignee' && value === 'none') {
      setFormData(prev => ({ ...prev, assignee: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addDependency = (taskId: string) => {
    if (!formData.dependencies.includes(taskId)) {
      setFormData(prev => ({...prev, dependencies: [...prev.dependencies, taskId]}));
    }
  };

  const removeDependency = (taskId: string) => {
    setFormData(prev => ({...prev, dependencies: prev.dependencies.filter((id: string) => id !== taskId)}));
  };

  const availableTasks = allTasks?.filter(t => 
    t.id !== task?.id && 
    !formData.dependencies?.includes(t.id)
  ) || [];

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim() || !task) return;
    setIsSavingTemplate(true);
    try {
      await createTemplate({
        name: templateName,
        description: task.description,
        priority: task.priority,
        points: task.points,
        user_id: user.id,
        team_id: task.team_id,
      });
      toast({ title: 'Success', description: 'Task template saved.' });
      setTemplateName('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
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
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={formData.assignee} onValueChange={(value) => handleChange('assignee', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <SelectItem value="loading" disabled>Loading users...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">None</SelectItem>
                    {user && <SelectItem value={user.id}>{user.email}</SelectItem>}
                    {users?.filter(u => u.id !== user?.id).map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name || u.username}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Dependencies Section */}
          <div>
            <Label className="flex items-center gap-2 mb-1"><Link className="h-4 w-4" />Dependencies</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.dependencies?.map((depId: string) => {
                const depTask = allTasks?.find(t => t.id === depId);
                return depTask ? (
                  <Badge key={depId} variant="secondary" className="gap-1">
                    {depTask.title}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeDependency(depId)} />
                  </Badge>
                ) : null;
              })}
            </div>
            <Select onValueChange={addDependency}>
              <SelectTrigger>
                <SelectValue placeholder="Add dependency..." />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(availableTask => (
                  <SelectItem key={availableTask.id} value={availableTask.id}>
                    {availableTask.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {task && (
            <>
              <Separator className="my-4" />
              <CommentsList taskId={task.id} />
              <Separator className="my-4" />
              <RemindersManager taskId={task.id} />
              <Separator className="my-4" />
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="py-4 space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="template-name"
                      placeholder="e.g., Weekly Report"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <Button onClick={handleSaveAsTemplate} disabled={isSavingTemplate || !templateName.trim()}>
                      {isSavingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
