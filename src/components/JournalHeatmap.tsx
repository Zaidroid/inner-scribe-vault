import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Card } from './ui/card';

interface JournalHeatmapProps {
  data: { date: string; count: number }[];
}

const JournalHeatmap = ({ data }: JournalHeatmapProps) => {
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Journaling Consistency</h3>
      <CalendarHeatmap
        startDate={oneYearAgo}
        endDate={today}
        values={data}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-github-${value.count}`;
        }}
        titleForValue={(value) => {
          return value ? `${value.date}: ${value.count} entries` : 'No entries';
        }}
      />
      <style>{`
        .react-calendar-heatmap .color-github-1 { fill: #0e4429; }
        .react-calendar-heatmap .color-github-2 { fill: #006d32; }
        .react-calendar-heatmap .color-github-3 { fill: #26a641; }
        .react-calendar-heatmap .color-github-4 { fill: #39d353; }
        .react-calendar-heatmap .color-empty { fill: #333; }
        .react-calendar-heatmap text { fill: #fff; }
      `}</style>
    </Card>
  );
};

export default JournalHeatmap; 