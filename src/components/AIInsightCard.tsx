
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, ArrowUp } from 'lucide-react';

interface AIInsightCardProps {
  insight: {
    title: string;
    summary: string;
    category: string;
    confidence: number;
  };
}

const AIInsightCard = ({ insight }: AIInsightCardProps) => {
  return (
    <Card className="glass-card p-6 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium">{insight.title}</h4>
            <Badge variant="secondary" className="mt-1 text-xs">
              {insight.category}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Confidence</div>
          <div className="font-bold text-green-400">{insight.confidence}%</div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{insight.summary}</p>
      
      <Button size="sm" variant="outline" className="w-full">
        <ArrowUp className="h-4 w-4 mr-2" />
        View Details
      </Button>
    </Card>
  );
};

export default AIInsightCard;
