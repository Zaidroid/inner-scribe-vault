import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

interface ReportGeneratorProps {
  onGenerate: (options: {
    startDate?: Date;
    endDate?: Date;
    includeTasks: boolean;
    includeJournal: boolean;
  }) => void;
}

const ReportGenerator = ({ onGenerate }: ReportGeneratorProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeJournal, setIncludeJournal] = useState(true);

  const handleGenerateClick = () => {
    onGenerate({
      startDate,
      endDate,
      includeTasks,
      includeJournal,
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <DatePicker date={startDate} setDate={setStartDate} />
        </div>
        <div>
          <Label>End Date</Label>
          <DatePicker date={endDate} setDate={setEndDate} />
        </div>
      </div>
      <div className="flex items-center space-x-4 my-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="include-tasks" checked={includeTasks} onCheckedChange={(checked) => setIncludeTasks(!!checked)} />
          <Label htmlFor="include-tasks">Include Tasks</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="include-journal" checked={includeJournal} onCheckedChange={(checked) => setIncludeJournal(!!checked)} />
          <Label htmlFor="include-journal">Include Journal Entries</Label>
        </div>
      </div>
      <Button onClick={handleGenerateClick}>Generate Report</Button>
    </div>
  );
};

export default ReportGenerator; 