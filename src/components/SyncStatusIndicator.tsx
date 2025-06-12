import React, { useState, useEffect } from 'react';
import { obsidianSync } from '../lib/obsidian';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// New hook for detailed status
export function useSyncDetailedStatus() {
    const [status, setStatus] = useState({
        isOnline: obsidianSync.getStatus().isOnline,
        isSyncing: false,
        pendingCount: 0,
    });

    useEffect(() => {
        const handleStatusChange = ({ isOnline }: { isOnline: boolean }) => {
            setStatus(s => ({ ...s, isOnline }));
        };
        const handleSyncStarted = () => setStatus(s => ({ ...s, isSyncing: true }));
        const handleSyncCompleted = () => setStatus(s => ({ ...s, isSyncing: false }));
        const handleQueueUpdated = (count: number) => setStatus(s => ({ ...s, pendingCount: count }));

        obsidianSync.on('status-changed', handleStatusChange);
        obsidianSync.on('sync-started', handleSyncStarted);
        obsidianSync.on('sync-completed', handleSyncCompleted);
        obsidianSync.on('queue-updated', handleQueueUpdated);

        // Initial check is not available on the new module, and it's not critical.

        return () => {
            obsidianSync.off('status-changed', handleStatusChange);
            obsidianSync.off('sync-started', handleSyncStarted);
            obsidianSync.off('sync-completed', handleSyncCompleted);
            obsidianSync.off('queue-updated', handleQueueUpdated);
        };
    }, []);

    return status;
}

// UI component to display the status
export function SyncStatusIndicator() {
  const [status, setStatus] = useState({
    isOnline: obsidianSync.getState().isSyncing,
  });

  useEffect(() => {
    const handleSyncStatusChange = (newState: any) => {
      setStatus({ isOnline: newState.isSyncing });
    };

    obsidianSync.on('sync-started', () => handleSyncStatusChange({ isSyncing: true }));
    obsidianSync.on('sync-completed', () => handleSyncStatusChange({ isSyncing: false }));
    obsidianSync.on('sync-error', () => handleSyncStatusChange({ isSyncing: false }));

    return () => {
      obsidianSync.removeListener('sync-started', () => handleSyncStatusChange({ isSyncing: true }));
      obsidianSync.removeListener('sync-completed', () => handleSyncStatusChange({ isSyncing: false }));
      obsidianSync.removeListener('sync-error', () => handleSyncStatusChange({ isSyncing: false }));
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Badge variant={status.isOnline ? 'default' : 'secondary'}>
        {status.isOnline ? 'Syncing...' : 'Idle'}
      </Badge>
    </motion.div>
  );
} 