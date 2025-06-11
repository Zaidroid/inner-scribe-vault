import React, { useState, useEffect } from 'react';
import { syncManager } from '../lib/sync';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

// New hook for detailed status
export function useSyncDetailedStatus() {
    const [status, setStatus] = useState({
        isOnline: syncManager.getStatus().isOnline,
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

        syncManager.on('status-changed', handleStatusChange);
        syncManager.on('sync-started', handleSyncStarted);
        syncManager.on('sync-completed', handleSyncCompleted);
        syncManager.on('queue-updated', handleQueueUpdated);

        // Initial check
        syncManager.checkQueue();

        return () => {
            syncManager.off('status-changed', handleStatusChange);
            syncManager.off('sync-started', handleSyncStarted);
            syncManager.off('sync-completed', handleSyncCompleted);
            syncManager.off('queue-updated', handleQueueUpdated);
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