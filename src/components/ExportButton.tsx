
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { obsidianSync } from '@/lib/obsidian';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  entry: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  entry, 
  variant = 'outline', 
  size = 'sm' 
}) => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const success = await obsidianSync.syncJournalEntry(entry);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Journal entry has been exported as markdown.",
        });
      } else {
        toast({
          title: "Export Disabled",
          description: "Obsidian sync is not enabled. Check your settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export journal entry.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
};

export default ExportButton;
