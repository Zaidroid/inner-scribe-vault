
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

const MEDITATION_PRESETS = [
  { duration: 300, label: '5 minutes', category: 'Quick' },
  { duration: 600, label: '10 minutes', category: 'Short' },
  { duration: 900, label: '15 minutes', category: 'Medium' },
  { duration: 1200, label: '20 minutes', category: 'Long' },
  { duration: 1800, label: '30 minutes', category: 'Extended' },
];

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Silence', description: 'Pure quiet meditation' },
  { id: 'rain', name: 'Rain', description: 'Gentle rainfall sounds' },
  { id: 'ocean', name: 'Ocean Waves', description: 'Rhythmic ocean waves' },
  { id: 'forest', name: 'Forest', description: 'Birds and nature sounds' },
  { id: 'bells', name: 'Tibetan Bells', description: 'Peaceful meditation bells' },
];

const MeditationTimer: React.FC = () => {
  const [duration, setDuration] = useState(600); // 10 minutes default
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState('none');
  const [hasStarted, setHasStarted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasStarted(false);
            toast({
              title: "Meditation Complete! 🧘‍♀️",
              description: "Great job on completing your meditation session.",
            });
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, duration, toast]);

  const startTimer = () => {
    setIsRunning(true);
    setHasStarted(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(duration);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setHasStarted(false);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="glass-card p-6">
      <div className="text-center space-y-6">
        <h3 className="text-xl font-semibold">Meditation Timer</h3>
        
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Select value={duration.toString()} onValueChange={(value) => {
                const newDuration = parseInt(value);
                setDuration(newDuration);
                setTimeLeft(newDuration);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDITATION_PRESETS.map((preset) => (
                    <SelectItem key={preset.duration} value={preset.duration.toString()}>
                      {preset.label} ({preset.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ambient Sound</label>
              <Select value={selectedSound} onValueChange={setSelectedSound}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AMBIENT_SOUNDS.map((sound) => (
                    <SelectItem key={sound.id} value={sound.id}>
                      {sound.name} - {sound.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="90"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-muted-foreground/20"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="90"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isRunning ? 'Meditating...' : hasStarted ? 'Paused' : 'Ready to start'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={startTimer}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Meditation
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-2"
              >
                <Button
                  onClick={isRunning ? pauseTimer : startTimer}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <Button onClick={stopTimer} variant="outline" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
                <Button onClick={resetTimer} variant="ghost" size="lg">
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
          >
            <p className="text-sm text-blue-400">
              🧘‍♀️ Focus on your breath. Let thoughts come and go without judgment.
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default MeditationTimer;
