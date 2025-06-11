import { EventEmitter } from 'eventemitter3';
import { VaultFile } from './types';
import { VaultWatcherError, VaultError } from './errors';

export interface FileChangeEvent {
  type: 'create' | 'modify' | 'delete';
  path: string;
  file?: VaultFile;
  timestamp: Date;
}

export class VaultWatcher extends EventEmitter {
  private watchId: number | null = null;
  private isWatching: boolean = false;
  private vaultPath: string | null = null;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 1000; // 1 second debounce

  constructor() {
    super();
  }

  async startWatching(vaultPath: string): Promise<void> {
    if (this.isWatching) {
      await this.stopWatching();
    }

    try {
      // Start watching the vault directory
      const response = await window.electron.ipcRenderer.invoke('start-vault-watch', {
        path: vaultPath,
        options: {
          recursive: true,
          ignoreInitial: true
        }
      });

      this.watchId = response.watchId;
      this.isWatching = true;
      this.vaultPath = vaultPath;

      // Set up event listeners for file system events
      window.electron.ipcRenderer.on('vault-file-change', this.handleFileChange.bind(this));
      window.electron.ipcRenderer.on('vault-watch-error', this.handleWatchError.bind(this));

      this.emit('watching-started', { vaultPath });
    } catch (err) {
      throw new VaultWatcherError(err instanceof Error ? err.message : 'Failed to start watcher');
    }
  }

  async stopWatching(): Promise<void> {
    if (!this.isWatching || !this.watchId) {
      return;
    }

    try {
      await window.electron.ipcRenderer.invoke('stop-vault-watch', {
        watchId: this.watchId
      });

      // Remove event listeners
      window.electron.ipcRenderer.removeListener('vault-file-change', this.handleFileChange.bind(this));
      window.electron.ipcRenderer.removeListener('vault-watch-error', this.handleWatchError.bind(this));

      this.watchId = null;
      this.isWatching = false;
      this.vaultPath = null;

      this.emit('watching-stopped');
    } catch (err) {
      throw new VaultWatcherError(err instanceof Error ? err.message : 'Failed to stop watcher');
    }
  }

  private handleFileChange(event: FileChangeEvent): void {
    // Debounce file change events to prevent rapid-fire updates
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.emit('file-change', event);
    }, this.DEBOUNCE_DELAY);
  }

  private handleWatchError(error: Error): void {
    this.emit('watching-error', error);
  }

  isActive(): boolean {
    return this.isWatching;
  }

  getVaultPath(): string | null {
    return this.vaultPath;
  }
} 