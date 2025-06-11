import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

interface ExportButtonsProps {
  reportData: {
    tasks: any[];
    journalEntries: any[];
  } | null;
}

const ExportButtons = ({ reportData }: ExportButtonsProps) => {
  const handleExportCsv = () => {
    if (!reportData) return;

    const { tasks, journalEntries } = reportData;
    let csv = '';

    if (tasks.length > 0) {
      csv += Papa.unparse(tasks);
      csv += '\n\n';
    }

    if (journalEntries.length > 0) {
      csv += Papa.unparse(journalEntries);
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-4">
      <Button onClick={handleExportCsv} disabled={!reportData}>
        <Download className="h-4 w-4 mr-2" />
        Export to CSV
      </Button>
    </div>
  );
};

export default ExportButtons; 