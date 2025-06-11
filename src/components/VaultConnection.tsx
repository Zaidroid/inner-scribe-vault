import React, { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { VaultConfig } from '../integrations/obsidian/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function VaultConnection() {
  const { connectionStatus, error, watcherStatus, syncState, connect, disconnect, sync } = useVault();
  const [vaultPath, setVaultPath] = useState('');
  const [vaultName, setVaultName] = useState('');

  const handleConnect = async () => {
    if (!vaultPath || !vaultName) {
      return;
    }

    const config: VaultConfig = {
      path: vaultPath,
      name: vaultName,
      isConnected: false
    };

    try {
      await connect(config);
    } catch (err) {
      console.error('Failed to connect to vault:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect from vault:', err);
    }
  };

  const handleSync = async () => {
    try {
      await sync();
    } catch (err) {
      console.error('Failed to sync vault:', err);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vault Connection</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="font-mono text-red-700 whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      {!connectionStatus.isConnected ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vault Name</label>
            <Input
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="Enter vault name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vault Path</label>
            <Input
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              placeholder="Enter vault path"
            />
          </div>
          <Button onClick={handleConnect} className="w-full">
            Connect to Vault
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-gray-500">Status: Connected</p>
                <Badge variant={watcherStatus.isActive ? "default" : "secondary"}>
                  {watcherStatus.isActive ? "Watching" : "Not Watching"}
                </Badge>
                {syncState.isSyncing && (
                  <Badge variant="outline">Syncing...</Badge>
                )}
              </div>
              {connectionStatus.lastSync && (
                <p className="text-sm text-gray-500">
                  Last sync: {connectionStatus.lastSync.toLocaleString()}
                </p>
              )}
              {watcherStatus.vaultPath && (
                <p className="text-sm text-gray-500">
                  Watching: {watcherStatus.vaultPath}
                </p>
              )}
              {syncState.pendingChanges.length > 0 && (
                <p className="text-sm text-gray-500">
                  Pending changes: {syncState.pendingChanges.length}
                </p>
              )}
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={handleSync}
                disabled={syncState.isSyncing}
              >
                {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                disabled={syncState.isSyncing}
              >
                Disconnect
              </Button>
            </div>
          </div>
          {syncState.isSyncing && (
            <Progress value={undefined} className="w-full" />
          )}
        </div>
      )}
    </Card>
  );
} 