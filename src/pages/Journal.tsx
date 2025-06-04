
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MoodSelector from '@/components/MoodSelector';
import { useJournal } from '@/hooks/useDatabase';
import { obsidianSync } from '@/lib/obsidian';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, User, Trash2, Download } from 'lucide-react';

const Journal = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const { entries, loading, addEntry, deleteEntry } = useJournal();
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || !entryContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    const entry = {
      title: entryTitle,
      content: entryContent,
      mood: selectedMood,
      tags,
    };
    
    try {
      await addEntry(entry);
      
      // Try to sync with Obsidian
      const synced = await obsidianSync.syncJournalEntry({
        ...entry,
        date: new Date().toISOString(),
      });
      
      toast({
        title: "Entry Saved",
        description: synced ? "Entry saved and synced to Obsidian" : "Entry saved locally",
      });
      
      // Reset form
      setEntryTitle('');
      setEntryContent('');
      setSelectedMood('');
      setTags([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      toast({
        title: "Entry Deleted",
        description: "Journal entry has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  const handleExportEntry = (entry: any) => {
    const markdown = `# ${entry.title}\n\n**Date:** ${new Date(entry.date).toLocaleDateString()}\n**Mood:** ${entry.mood}\n**Tags:** ${entry.tags.join(', ')}\n\n${entry.content}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Journal</h1>
          <p className="text-muted-foreground mt-1">Capture your thoughts and track your mood</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Entry Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              New Entry
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="What's on your mind?"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                />
              </div>

              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="Write your thoughts here..."
                  className="min-h-[120px]"
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <Button 
                onClick={handleSaveEntry} 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={!entryTitle || !entryContent}
              >
                Save Entry
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Recent Entries ({entries.length})
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center text-muted-foreground">No entries yet. Start writing!</div>
              ) : (
                <AnimatePresence>
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="p-4 border border-white/10 hover-lift cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{entry.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.date).toLocaleDateString()}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportEntry(entry)}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {entry.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Mood:</span>
                            <span className="text-sm">
                              {entry.mood === 'great' && '😊'}
                              {entry.mood === 'good' && '🙂'}
                              {entry.mood === 'okay' && '😐'}
                              {entry.mood === 'bad' && '😔'}
                              {entry.mood === 'terrible' && '😢'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Journal;
