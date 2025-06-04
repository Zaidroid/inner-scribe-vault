
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, List, Settings } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: User, label: 'Dashboard' },
    { path: '/journal', icon: Calendar, label: 'Journal' },
    { path: '/habits', icon: List, label: 'Habits' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <Card className="glass-card fixed bottom-4 left-1/2 transform -translate-x-1/2 p-2 z-50 md:hidden">
      <div className="flex space-x-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate(item.path)}
            className="flex-col h-12 w-16 text-xs"
          >
            <item.icon className="h-4 w-4 mb-1" />
            {item.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default Navigation;
