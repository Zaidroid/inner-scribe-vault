
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MoodSelector from '@/components/MoodSelector';
import { Plus, Calendar, User } from 'lucide-react';

const Journal = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveEntry = () => {
    const entry = {
      id: Date.now().toString(),
      title: entryTitle,
      content: entryContent,
      mood: selectedMood,
      tags,
      date: new Date().toISOString(),
    };
    
    console.log('Saving entry:', entry);
    // Implement save logic to IndexedDB
    
    // Reset form
    setEntryTitle('');
    setEntryContent('');
    setSelectedMood('');
    setTags([]);
  };

  const recentEntries = [
    {
      id: '1',
      title: 'Morning Reflections',
      content: 'Started the day with meditation. Feeling more centered and focused...',
      mood: 'great',
      date: '2024-01-15',
      tags: ['meditation', 'morning'],
    },
    {
      id: '2',
      title: 'Project Completion',
      content: 'Finished the quarterly report today. Feeling accomplished but also exhausted...',
      mood: 'good',
      date: '2024-01-14',
      tags: ['work', 'achievement'],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
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

        {/* Recent Entries */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Recent Entries
          </h3>
          
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <Card key={entry.id} className="p-4 border border-white/10 hover-lift cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{entry.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {entry.date}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {entry.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {entry.tags.map((tag) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Journal;
