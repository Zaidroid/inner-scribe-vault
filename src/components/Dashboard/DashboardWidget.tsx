
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grip, X } from 'lucide-react';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
}

const DashboardWidget = ({ id, title, children, onRemove, className }: DashboardWidgetProps) => {
  return (
    <Card className={`p-4 glass-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grip className="h-4 w-4 text-muted-foreground cursor-move" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {children}
    </Card>
  );
};

export default DashboardWidget;
