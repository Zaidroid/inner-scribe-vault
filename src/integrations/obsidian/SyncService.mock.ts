import { EventEmitter } from 'eventemitter3';

export class SyncService extends EventEmitter {
  constructor() {
    super();
  }
  sync(vaultPath: string): Promise<void> {
    return Promise.resolve();
  }
  addPendingChange(change: any): void {}
  setOptions(options: any): void {}
  getState() {
    return {
      lastSync: new Date(),
      pendingChanges: [],
      isSyncing: false,
    };
  }
} 