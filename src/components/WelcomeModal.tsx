import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/database';

const tourSteps = [
  {
    title: 'Welcome to Inner Scribe!',
    content: 'This quick tour will walk you through the key features to get you started on your journey of self-mastery.',
  },
  {
    title: 'The Dashboard',
    content: 'Your central hub. Here you can see your stats, track your goals, and get a quick overview of your progress.',
  },
  {
    title: 'The Journal',
    content: 'Capture your thoughts, reflections, and daily experiences. Use Cmd/Ctrl+N to create a new entry anytime!',
  },
  {
    title: 'Task Management',
    content: 'Organize your life with our Kanban board. Drag tasks between columns, and swipe to complete them. Try Cmd/Ctrl+T to create a new task.',
  },
  {
    title: 'Settings & Integrations',
    content: 'Customize your experience, connect to your AI provider, and sync with your Obsidian vault in the Settings area.',
  },
  {
    title: 'You\'re All Set!',
    content: 'Enjoy your journey with Inner Scribe. We\'re excited to see what you achieve!',
  },
];

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasCompleted = await db.getSetting('hasCompletedOnboarding');
      if (!hasCompleted) {
        setIsOpen(true);
      }
    };
    checkOnboardingStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    await db.saveSetting('hasCompletedOnboarding', true);
  };

  const step = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            <p className="text-muted-foreground">{step.content}</p>
          </motion.div>
        </AnimatePresence>
        <DialogFooter className="flex justify-between w-full">
            <div>
                {currentStep > 0 && (
                    <Button variant="outline" onClick={handlePrev}>
                        Previous
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">{`${currentStep + 1} / ${tourSteps.length}`}</span>
                <Button onClick={handleNext}>
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal; 