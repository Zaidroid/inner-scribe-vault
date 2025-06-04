
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, List, Settings, Plus } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: User, label: 'Dashboard' },
    { path: '/journal', icon: Calendar, label: 'Journal' },
    { path: '/habits', icon: List, label: 'Habits' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="hidden md:block w-64 h-screen p-4 fixed left-0 top-0">
      <Card className="glass-card h-full p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">SelfMastery</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-Powered Growth</p>
        </div>

        <div className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </div>

        <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Quick Add
        </Button>

        <div className="mt-auto pt-8">
          <div className="text-xs text-muted-foreground">
            <p>Data stored locally</p>
            <p className="text-green-400 mt-1">🔒 Encrypted & Private</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
