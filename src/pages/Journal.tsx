import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import JournalEntryForm from '@/components/JournalEntryForm';
import ExportButton from '@/components/ExportButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useJournal } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useHotkeys } from '@/hooks/useHotkeys';

const Journal = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const { entries, loading, addEntry, deleteEntry } = useJournal();
  const { toast } = useToast();

  const hotkeys = {
    'Cmd+N': useCallback(() => setShowForm(true), []),
    'Ctrl+N': useCallback(() => setShowForm(true), []),
    'Escape': useCallback(() => {
      if (showForm) {
        setShowForm(false);
      }
    }, [showForm]),
  };
  useHotkeys(hotkeys);

  const handleSaveEntry = async (entry: any) => {
    try {
      await addEntry(entry);
      setShowForm(false);
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
        setSelectedEntry(null);
        toast({
          title: "Entry Deleted",
          description: "Journal entry has been deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete entry.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNavigateEntry = (direction: 'next' | 'prev') => {
    if (!selectedEntry) return;

    const currentIndex = entries.findIndex(e => e.id === selectedEntry.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < entries.length) {
      setSelectedEntry(entries[newIndex]);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMoodColor = (mood: string) => {
    const colors = {
      great: 'bg-green-500',
      good: 'bg-blue-500',
      okay: 'bg-yellow-500',
      bad: 'bg-orange-500',
      terrible: 'bg-red-500',
    };
    return colors[mood as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your journal..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Journal</h1>
          <p className="text-muted-foreground mt-1">Capture your thoughts and reflections</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <JournalEntryForm
            onSave={handleSaveEntry}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <Card className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entries List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Your Entries ({filteredEntries.length})
          </h3>
          
          {filteredEntries.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No entries match your search.' : 'Start your journey by writing your first entry.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Write First Entry
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className={`glass-card p-4 cursor-pointer transition-colors hover:bg-white/5 ${
                      selectedEntry?.id === entry.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{entry.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`h-2 w-2 rounded-full ${getMoodColor(entry.mood)}`} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Entry Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Entry Details</h3>
          
          <AnimatePresence initial={false}>
            {selectedEntry ? (
              <motion.div
                key={selectedEntry.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(event, info) => {
                  const offset = info.offset.x;
                  if (offset > 100) {
                    handleNavigateEntry('prev');
                  } else if (offset < -100) {
                    handleNavigateEntry('next');
                  }
                }}
              >
                <Card className="glass-card p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-semibold">{selectedEntry.title}</h2>
                      <div className="flex gap-2">
                        <ExportButton entry={selectedEntry} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(selectedEntry.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedEntry.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getMoodColor(selectedEntry.mood)}`} />
                        {selectedEntry.mood}
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                    </div>

                    {selectedEntry.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass-card p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select an Entry</h3>
                <p className="text-muted-foreground">
                  Choose an entry from the list to view its details.
                </p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Journal;
