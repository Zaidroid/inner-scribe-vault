
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grip, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
}

const DashboardWidget = ({ id, title, children, onRemove, className }: DashboardWidgetProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 glass-card border border-white/10 bg-card/60 backdrop-blur-lg shadow-xl ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="cursor-move"
            >
              <Grip className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </motion.div>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          {onRemove && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default DashboardWidget;
