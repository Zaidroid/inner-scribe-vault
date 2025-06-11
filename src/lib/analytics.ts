import { startOfWeek, format, parseISO, eachDayOfInterval, compareAsc } from 'date-fns';

// In analytics.ts
// ... imports

// ... moodToScore map ...

interface Task {
  created_at: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
}

interface JournalEntry {
  date: string;
  mood: string;
}

interface MoodTrendPoint {
  date: string;
  dailyAverage: number | null;
  movingAverage: number | null;
}

const moodToScore: Record<string, number> = {
  '😊': 5, 'Happy': 5,
  '😌': 4, 'Calm': 4,
  '🤔': 3, 'Thoughtful': 3,
  '😴': 2, 'Tired': 2,
  '😰': 1, 'Anxious': 1,
  '😤': 1, 'Frustrated': 1,
  '😢': 1, 'Sad': 1,
  'terrible': 1,
  'bad': 2,
  'okay': 3,
  'good': 4,
  'great': 5,
};

export const processTaskDataForChart = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return [];

  const weeklyData = tasks.reduce((acc, task) => {
    const weekStart = format(startOfWeek(parseISO(task.created_at)), 'yyyy-MM-dd');
    if (!acc[weekStart]) {
      acc[weekStart] = { name: `Week of ${weekStart}`, created: 0, completed: 0 };
    }
    acc[weekStart].created += 1;
    if (task.status === 'done') {
      acc[weekStart].completed += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; created: number; completed: number }>);

  return Object.values(weeklyData).sort((a, b) => a.name.localeCompare(b.name));
};

export const processMoodDataForChart = (entries: JournalEntry[]) => {
  if (!entries || entries.length === 0) return [];

  const moodCounts = entries.reduce((acc, entry) => {
    const mood = entry.mood || 'neutral';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
};

export const processTaskPriorityForChart = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return [];

  const priorityCounts = tasks.reduce((acc, task) => {
    const priority = task.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
};

export const processJournalForHeatmap = (entries: JournalEntry[]) => {
  if (!entries || entries.length === 0) return [];

  const dateCounts = entries.reduce((acc, entry) => {
    const entryDate = format(parseISO(entry.date), 'yyyy-MM-dd');
    acc[entryDate] = (acc[entryDate] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
};

export const processMoodTrendForChart = (entries: JournalEntry[]): MoodTrendPoint[] => {
  if (entries.length < 2) return [];

  const sortedEntries = entries
    .map(e => ({ ...e, date: parseISO(e.date) }))
    .sort((a, b) => compareAsc(a.date, b.date));

  const dailyScores = sortedEntries.reduce((acc, entry) => {
    const day = format(entry.date, 'yyyy-MM-dd');
    const score = moodToScore[entry.mood] || 3;
    if (!acc[day]) {
      acc[day] = { scores: [], avg: 0 };
    }
    acc[day].scores.push(score);
    acc[day].avg = acc[day].scores.reduce((a, b) => a + b, 0) / acc[day].scores.length;
    return acc;
  }, {} as Record<string, { scores: number[], avg: number }>);

  const allDays = eachDayOfInterval({
    start: sortedEntries[0].date,
    end: sortedEntries[sortedEntries.length - 1].date,
  });

  const chartData: MoodTrendPoint[] = allDays.map(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    return {
      date: format(day, 'MMM d'),
      dailyAverage: dailyScores[dayKey]?.avg || null,
      movingAverage: null,
    };
  });

  // Calculate 7-day moving average
  for (let i = 0; i < chartData.length; i++) {
    if (i >= 6) {
      const window = chartData.slice(i - 6, i + 1).map(d => d.dailyAverage).filter(d => d !== null) as number[];
      if (window.length > 0) {
        const avg = window.reduce((a, b) => a + b, 0) / window.length;
        chartData[i].movingAverage = parseFloat(avg.toFixed(2));
      }
    }
  }

  return chartData;
};
