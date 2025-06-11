import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, List, Settings, DollarSign, Users, Zap } from 'lucide-react';
import { Kanban } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: User, label: 'Dashboard' },
    { path: '/journal', icon: Calendar, label: 'Journal' },
    { path: '/habits', icon: List, label: 'Habits' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/tasks', icon: Kanban, label: 'Tasks' },
    { path: '/activity', icon: Zap, label: 'Activity' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="md:hidden"
    >
      <Card className="glass-card fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 z-50 border border-white/10 bg-card/80 backdrop-blur-lg shadow-2xl">
        <div className="flex items-center space-x-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex-col h-14 w-14 text-xs p-1 transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 mb-1" />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Button>
            </motion.div>
          ))}
          <motion.div 
            className="ml-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            <UserMenu />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Navigation;
