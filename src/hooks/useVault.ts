import { useState, useEffect } from 'react';
import { VaultService } from '../integrations/obsidian/VaultService';
import { VaultConfig, VaultFile, VaultSettings } from '../integrations/obsidian/types';
import { ParsedMarkdown } from '../integrations/obsidian/MarkdownParser';
import { ObsidianPlugin } from '../integrations/obsidian/plugins/types';
import { VaultError } from '../integrations/obsidian/errors';

export function useVault() {
  const [vaultService] = useState(() => new VaultService());
  const [connectionStatus, setConnectionStatus] = useState<{ isConnected: boolean; lastSync?: Date }>({ isConnected: false });
  const [error, setError] = useState<string | null>(null);
  const [watcherStatus, setWatcherStatus] = useState<{ isActive: boolean; vaultPath?: string }>({ isActive: false });
  const [syncState, setSyncState] = useState<{ isSyncing: boolean; pendingChanges: any[] }>({ isSyncing: false, pendingChanges: [] });
  const [enabledPlugins, setEnabledPlugins] = useState<ObsidianPlugin[]>([]);
  const [settings, setSettings] = useState<VaultSettings>(vaultService.getSettings());
  const [backupHistory, setBackupHistory] = useState<string[]>([]);

  useEffect(() => {
    const handleSync = () => {
      setConnectionStatus(prev => ({ ...prev, lastSync: new Date() }));
    };

    const handleError = (error: Error) => {
      if (error instanceof VaultError) {
        setError(`${error.name}: ${error.message}`);
      } else {
        setError(error.message);
      }
    };

    const handleFileChange = (file: VaultFile) => {
      // Handle file change
    };

    const handleSyncStarted = () => {
      setSyncState(prev => ({ ...prev, isSyncing: true }));
    };

    const handleSyncCompleted = () => {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    };

    const handleConflictsDetected = (conflicts: any[]) => {
      setSyncState(prev => ({ ...prev, pendingChanges: conflicts }));
    };

    const handleWatcherStatus = (status: { isActive: boolean; vaultPath?: string }) => {
      setWatcherStatus(status);
    };

    const handleSettingsUpdated = (newSettings: VaultSettings) => {
      setSettings(newSettings);
    };

    const handleBackupStarted = () => {
      // Handle backup started
    };

    const handleBackupCompleted = (backupPath: string) => {
      setBackupHistory(prev => [...prev, backupPath]);
    };

    const handleBackupError = (error: Error) => {
      if (error instanceof VaultError) {
        setError(`${error.name}: ${error.message}`);
      } else {
        setError(error.message);
      }
    };

    vaultService.on('sync', handleSync);
    vaultService.on('error', handleError);
    vaultService.on('fileChange', handleFileChange);
    vaultService.on('syncStarted', handleSyncStarted);
    vaultService.on('syncCompleted', handleSyncCompleted);
    vaultService.on('conflictsDetected', handleConflictsDetected);
    vaultService.on('watcherStatus', handleWatcherStatus);
    vaultService.on('settingsUpdated', handleSettingsUpdated);
    vaultService.on('backup-started', handleBackupStarted);
    vaultService.on('backup-completed', handleBackupCompleted);
    vaultService.on('backup-error', handleBackupError);

    // Load enabled plugins
    setEnabledPlugins(vaultService.getEnabledPlugins());

    return () => {
      vaultService.removeListener('sync', handleSync);
      vaultService.removeListener('error', handleError);
      vaultService.removeListener('fileChange', handleFileChange);
      vaultService.removeListener('syncStarted', handleSyncStarted);
      vaultService.removeListener('syncCompleted', handleSyncCompleted);
      vaultService.removeListener('conflictsDetected', handleConflictsDetected);
      vaultService.removeListener('watcherStatus', handleWatcherStatus);
      vaultService.removeListener('settingsUpdated', handleSettingsUpdated);
      vaultService.removeListener('backup-started', handleBackupStarted);
      vaultService.removeListener('backup-completed', handleBackupCompleted);
      vaultService.removeListener('backup-error', handleBackupError);
    };
  }, [vaultService]);

  const connect = async (config: VaultConfig) => {
    try {
      await vaultService.connect(config);
      setConnectionStatus({ isConnected: true });
      setError(null);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to vault');
      }
      throw err;
    }
  };

  const disconnect = async () => {
    try {
      await vaultService.disconnect();
      setConnectionStatus({ isConnected: false });
      setError(null);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to disconnect from vault');
      }
      throw err;
    }
  };

  const sync = async () => {
    try {
      await vaultService.sync();
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sync vault');
      }
      throw err;
    }
  };

  const getFile = async (path: string): Promise<VaultFile> => {
    try {
      return await vaultService.getFile(path);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to get file');
      }
      throw err;
    }
  };

  const saveFile = async (path: string, content: string): Promise<void> => {
    try {
      await vaultService.saveFile(path, content);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save file');
      }
      throw err;
    }
  };

  const getParsedFile = async (path: string): Promise<ParsedMarkdown> => {
    try {
      return await vaultService.getParsedFile(path);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to parse file');
      }
      throw err;
    }
  };

  const saveParsedFile = async (path: string, parsed: ParsedMarkdown): Promise<void> => {
    try {
      await vaultService.saveParsedFile(path, parsed);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save parsed file');
      }
      throw err;
    }
  };

  // Plugin management methods
  const enablePlugin = async (pluginId: string) => {
    try {
      await vaultService.enablePlugin(pluginId);
      setEnabledPlugins(vaultService.getEnabledPlugins());
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to enable plugin');
      }
      throw err;
    }
  };

  const disablePlugin = async (pluginId: string) => {
    try {
      await vaultService.disablePlugin(pluginId);
      setEnabledPlugins(vaultService.getEnabledPlugins());
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to disable plugin');
      }
      throw err;
    }
  };

  const getPluginSettings = async (pluginId: string) => {
    try {
      return await vaultService.getPluginSettings(pluginId);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to get plugin settings');
      }
      throw err;
    }
  };

  const updatePluginSettings = async (pluginId: string, settings: Record<string, any>) => {
    try {
      await vaultService.updatePluginSettings(pluginId, settings);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update plugin settings');
      }
      throw err;
    }
  };

  // Configuration methods
  const updateSettings = async (newSettings: Partial<VaultSettings>) => {
    try {
      await vaultService.updateSettings(newSettings);
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update settings');
      }
      throw err;
    }
  };

  // Backup methods
  const triggerBackup = async () => {
    try {
      await vaultService.triggerBackup();
    } catch (err) {
      if (err instanceof VaultError) {
        setError(`${err.name}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to trigger backup');
      }
      throw err;
    }
  };

  return {
    connectionStatus,
    error,
    watcherStatus,
    syncState,
    enabledPlugins,
    settings,
    backupHistory,
    connect,
    disconnect,
    sync,
    getFile,
    saveFile,
    getParsedFile,
    saveParsedFile,
    enablePlugin,
    disablePlugin,
    getPluginSettings,
    updatePluginSettings,
    updateSettings,
    triggerBackup
  };
} 