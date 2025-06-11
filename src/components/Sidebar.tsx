import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Calendar, List, Settings, Plus, DollarSign, BrainCircuit, Users, Zap } from 'lucide-react';
import { Kanban } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useModalStore } from '@/hooks/useModalStore';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const openModal = useModalStore((state) => state.openModal);
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: User, label: t('dashboard') },
    { path: '/journal', icon: Calendar, label: t('journal') },
    { path: '/habits', icon: List, label: t('habits') },
    { path: '/finance', icon: DollarSign, label: t('finance') },
    { path: '/tasks', icon: Kanban, label: t('tasks') },
    { path: '/analytics', icon: BrainCircuit, label: t('analytics') },
    { path: '/activity', icon: Zap, label: t('activity') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="hidden md:block w-64 h-screen p-4 fixed left-0 top-0 z-50">
      <Card className="glass-card h-full p-6 border border-white/10 bg-card/60 backdrop-blur-lg shadow-2xl flex flex-col">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-2xl font-bold gradient-text"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                SelfMastery
              </motion.h1>
              <p className="text-sm text-muted-foreground mt-1">AI-Powered Growth</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-2 mb-8 flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Button
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className={`w-full justify-start transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-auto">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={() => openModal('TaskForm')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </motion.div>
    
            <motion.div 
              className="pt-4 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="text-xs text-muted-foreground space-y-2">
                <SyncStatusIndicator />
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Data stored securely
                </p>
                <p className="text-green-400 flex items-center gap-1">
                  🔒 Encrypted & Private
                </p>
              </div>
            </motion.div>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
