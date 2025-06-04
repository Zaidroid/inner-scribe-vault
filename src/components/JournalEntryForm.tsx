
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';

interface JournalEntryFormProps {
  onSave: (entry: any) => void;
  onCancel: () => void;
  initialEntry?: any;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  onSave,
  onCancel,
  initialEntry
}) => {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState(initialEntry?.mood || '😊');
  const [tags, setTags] = useState(initialEntry?.tags?.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const moodOptions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😤', label: 'Frustrated' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😍', label: 'Excited' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const entry = {
      id: initialEntry?.id || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: initialEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await onSave(entry);
      toast({
        title: initialEntry ? "Entry Updated" : "Entry Saved",
        description: "Your journal entry has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {initialEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind today?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mood">How are you feeling?</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.emoji}
                    type="button"
                    onClick={() => setMood(option.emoji)}
                    className={`p-2 rounded-lg border transition-all ${
                      mood === option.emoji
                        ? 'border-primary bg-primary/10 scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span className="text-xs block">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your thoughts, experiences, or reflections..."
                className="mt-1 min-h-[200px]"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gratitude, work, family, goals..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : (initialEntry ? 'Update Entry' : 'Save Entry')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default JournalEntryForm;
