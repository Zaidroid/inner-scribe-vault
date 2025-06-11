import { EventEmitter } from 'eventemitter3';
import { VaultFile } from './types';
import { MarkdownParser, ParsedMarkdown } from './MarkdownParser';
import { VaultSyncError, VaultError } from './errors';

export interface SyncState {
  lastSync: Date;
  pendingChanges: PendingChange[];
  isSyncing: boolean;
  error?: string;
}

export interface PendingChange {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  timestamp: Date;
  source: 'app' | 'vault';
}

export interface SyncOptions {
  conflictResolution: 'app-wins' | 'vault-wins' | 'newer-wins' | 'manual';
  syncInterval: number;
  autoSync: boolean;
  syncOnChange: boolean;
}

export class SyncService extends EventEmitter {
  private state: SyncState = {
    lastSync: new Date(),
    pendingChanges: [],
    isSyncing: false
  };
  private options: SyncOptions = {
    conflictResolution: 'newer-wins',
    syncInterval: 5000,
    autoSync: true,
    syncOnChange: true
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private parser: MarkdownParser;

  constructor() {
    super();
    this.parser = new MarkdownParser();
  }

  async sync(vaultPath: string): Promise<void> {
    if (this.state.isSyncing) {
      return;
    }

    try {
      this.state.isSyncing = true;
      this.emit('sync-started');

      // Get vault changes
      const vaultChanges = await this.getVaultChanges(vaultPath);
      
      // Get app changes
      const appChanges = this.state.pendingChanges;

      // Resolve conflicts and merge changes
      const resolvedChanges = await this.resolveConflicts(vaultChanges, appChanges);

      // Apply changes
      await this.applyChanges(vaultPath, resolvedChanges);

      // Update state
      this.state.lastSync = new Date();
      this.state.pendingChanges = [];
      this.state.isSyncing = false;

      this.emit('sync-completed', {
        timestamp: this.state.lastSync,
        changesApplied: resolvedChanges.length
      });
    } catch (err) {
      this.state.isSyncing = false;
      this.state.error = err instanceof Error ? err.message : 'Vault sync failed';
      this.emit('sync-error', err);
      throw new VaultSyncError(err instanceof Error ? err.message : 'Vault sync failed');
    }
  }

  private async getVaultChanges(vaultPath: string): Promise<PendingChange[]> {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-vault-changes', {
        vaultPath,
        since: this.state.lastSync
      });

      return response.changes.map((change: any) => ({
        type: change.type,
        path: change.path,
        content: change.content,
        timestamp: new Date(change.timestamp),
        source: 'vault'
      }));
    } catch (err) {
      throw new VaultSyncError(err instanceof Error ? err.message : 'Failed to get vault changes');
    }
  }

  private async resolveConflicts(
    vaultChanges: PendingChange[],
    appChanges: PendingChange[]
  ): Promise<PendingChange[]> {
    const resolvedChanges: PendingChange[] = [];
    const conflicts: PendingChange[] = [];

    // Group changes by path
    const changesByPath = new Map<string, PendingChange[]>();
    
    [...vaultChanges, ...appChanges].forEach(change => {
      const existing = changesByPath.get(change.path) || [];
      changesByPath.set(change.path, [...existing, change]);
    });

    // Resolve conflicts for each path
    for (const [path, changes] of changesByPath) {
      if (changes.length === 1) {
        resolvedChanges.push(changes[0]);
        continue;
      }

      // Handle conflicts based on resolution strategy
      switch (this.options.conflictResolution) {
        case 'app-wins':
          resolvedChanges.push(changes.find(c => c.source === 'app')!);
          break;
        case 'vault-wins':
          resolvedChanges.push(changes.find(c => c.source === 'vault')!);
          break;
        case 'newer-wins':
          resolvedChanges.push(
            changes.reduce((latest, current) => 
              current.timestamp > latest.timestamp ? current : latest
            )
          );
          break;
        case 'manual':
          conflicts.push(...changes);
          break;
      }
    }

    if (conflicts.length > 0) {
      this.emit('conflicts-detected', conflicts);
    }

    return resolvedChanges;
  }

  private async applyChanges(vaultPath: string, changes: PendingChange[]): Promise<void> {
    try {
      for (const change of changes) {
        await window.electron.ipcRenderer.invoke('save-vault-file', {
          vaultPath,
          file: {
            path: change.path,
            content: change.content || '',
            lastModified: change.timestamp,
            type: 'markdown'
          }
        });
      }
    } catch (err) {
      throw new VaultSyncError(err instanceof Error ? err.message : 'Failed to apply changes');
    }
  }

  addPendingChange(change: Omit<PendingChange, 'timestamp'>): void {
    this.state.pendingChanges.push({
      ...change,
      timestamp: new Date()
    });
    this.emit('pending-changes-updated', this.state.pendingChanges);
  }

  setOptions(options: Partial<SyncOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };

    if (this.options.autoSync) {
      this.startAutoSync();
    } else if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.state.pendingChanges.length > 0) {
        this.sync(this.state.pendingChanges[0].path);
      }
    }, this.options.syncInterval);
  }

  getState(): SyncState {
    return { ...this.state };
  }
} 