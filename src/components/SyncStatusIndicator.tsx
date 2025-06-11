import React, { useState, useEffect } from 'react';
import { obsidianSync } from '../lib/obsidian';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

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
  const { isOnline, isSyncing, pendingCount } = useSyncDetailedStatus();

  if (isSyncing) {
    return (
      <Badge variant="default" className="flex items-center gap-2 bg-blue-500 text-white">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Syncing...</span>
      </Badge>
    );
  }

  return (
    <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
          {pendingCount > 0 && <span className="text-xs">({pendingCount})</span>}
        </>
      )}
    </Badge>
  );
} 