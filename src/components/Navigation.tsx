
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, List, Settings, DollarSign } from 'lucide-react';
import { Kanban } from 'lucide-react';
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
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Card className="glass-card fixed bottom-4 left-1/2 transform -translate-x-1/2 p-2 z-50 md:hidden">
      <div className="flex items-center space-x-1">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex-col h-12 w-12 text-xs p-1"
          >
            <item.icon className="h-3 w-3 mb-1" />
            <span className="text-[10px] leading-none">{item.label}</span>
          </Button>
        ))}
        <div className="ml-2">
          <UserMenu />
        </div>
      </div>
    </Card>
  );
};

export default Navigation;
