import React from 'react';
import { useTaskTemplates, type TaskTemplate } from '@/hooks/useTaskTemplates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from './LoadingSpinner';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

export const TemplateSelectionModal = ({ isOpen, onClose, onSelectTemplate }: TemplateSelectionModalProps) => {
  const { templates, isLoading } = useTaskTemplates();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task from Template</DialogTitle>
          <DialogDescription>
            Select a template to start a new task with pre-filled details.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : (
          <ScrollArea className="h-[60vh]">
            <div className="p-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.length > 0 ? templates.map(template => (
                <Card 
                  key={template.id} 
                  className="hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                >
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description || 'No description.'}
                    </p>
                  </CardContent>
                </Card>
              )) : (
                <p className="text-muted-foreground col-span-2 text-center py-8">
                  You haven't created any templates yet.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}; 