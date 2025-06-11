import { type Task } from './useSupabaseTasks';
import { useMemo } from 'react';

// A simple function to generate a goal suggestion.
const generateSuggestion = (tasks: Task[]): string | null => {
  if (tasks.length === 0) return null;
  
  const keywords = tasks.map(t => t.title.split(' ')).flat();
  const mostCommonWord = keywords.reduce((acc, word) => {
    if (['a', 'the', 'to', 'and', 'in', 'on', 'for', 'with'].includes(word.toLowerCase())) return acc;
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedWords = Object.keys(mostCommonWord).sort((a, b) => mostCommonWord[b] - mostCommonWord[a]);
  
  if (sortedWords.length === 0) return "Keep up the great work!";

  return `Focus more on ${sortedWords[0]}.`;
};

export const useGoalSuggester = (allTasks: Task[] | undefined) => {
  const recentlyCompletedTasks = useMemo(() => {
    if (!allTasks) return [];
    return allTasks
      .filter(task => task.status === 'done')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [allTasks]);

  const suggestion = useMemo(() => generateSuggestion(recentlyCompletedTasks), [recentlyCompletedTasks]);

  return {
    suggestion,
    basedOnTasks: recentlyCompletedTasks,
  };
}; 