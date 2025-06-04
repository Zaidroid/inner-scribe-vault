
import React from 'react';
import { Button } from '@/components/ui/button';

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
}

const MoodSelector = ({ selectedMood, onMoodSelect }: MoodSelectorProps) => {
  const moods = [
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😔', label: 'Bad', value: 'bad' },
    { emoji: '😢', label: 'Terrible', value: 'terrible' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">How are you feeling?</label>
      <div className="flex gap-2 flex-wrap">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant={selectedMood === mood.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onMoodSelect(mood.value)}
            className="flex-col h-16 w-16 p-2"
          >
            <span className="text-lg mb-1">{mood.emoji}</span>
            <span className="text-xs">{mood.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
