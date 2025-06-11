import { db } from './database';
import EventEmitter from 'eventemitter3';

type ConflictResolutionStrategy = 'local-wins' | 'remote-wins' | 'newer-wins' | 'manual';

const MAX_RETRIES = 5;

class SyncManager extends EventEmitter {
  private isOnline: boolean = navigator.onLine;
  private strategy: ConflictResolutionStrategy = 'newer-wins'; // Default strategy
  private backgroundSyncInterval: NodeJS.Timeout | null = null;
  private syncIntervalMs: number = 60000; // Default to 1 minute

  constructor() {
    super();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.checkQueue();
  }

  public async checkQueue(): Promise<void> {
    const mutations = await db.getMutations();
    this.emit('queue-updated', mutations.length);
  }

  public setStrategy(strategy: ConflictResolutionStrategy) {
    this.strategy = strategy;
  }

  public configure(options: { interval?: number, enabled?: boolean }) {
    if (options.interval) {
        this.syncIntervalMs = options.interval;
    }
    
    if (options.enabled) {
        this.startBackgroundSync();
    } else {
        this.stopBackgroundSync();
    }
  }

  public startBackgroundSync() {
    this.stopBackgroundSync(); // Ensure no multiple intervals
    if (this.isOnline) {
      this.backgroundSyncInterval = setInterval(() => {
        console.log('Performing periodic background sync...');
        this.processQueue();
      }, this.syncIntervalMs);
    }
  }

  public stopBackgroundSync() {
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.emit('status-changed', { isOnline: this.isOnline });
    console.log('Application is online. Processing mutation queue...');
    this.processQueue();
    this.startBackgroundSync(); // Start background sync when coming online
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.emit('status-changed', { isOnline: this.isOnline });
    console.log('Application is offline. Mutations will be queued.');
  };

  public async processQueue(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot process queue: application is offline.');
      return;
    }

    const mutations = await db.getMutations();
    if (mutations.length === 0) {
      console.log('Mutation queue is empty.');
      return;
    }

    this.emit('sync-started');
    console.log(`Processing ${mutations.length} mutations...`);

    for (const mutation of mutations) {
      try {
        // --- CONFLICT RESOLUTION LOGIC ---
        // This is a simulation. In a real app, you'd fetch the remote item.
        const remoteItem = await this.getSimulatedRemoteItem(mutation.payload);

        if (remoteItem && this.hasConflict(mutation.payload, remoteItem)) {
          console.log(`Conflict detected for item ${mutation.payload.id}. Strategy: ${this.strategy}`);
          const resolved = this.resolveConflict(mutation.payload, remoteItem);
          
          if (resolved) {
             // If resolved, we would save the resolved version.
             console.log('Conflict resolved. Saving version:', resolved);
             await this.applyMutation({ ...mutation, payload: resolved });
          } else {
             // Manual resolution needed
             console.log('Manual conflict resolution required.');
             // We would emit an event here for the UI to handle.
             continue; // Skip deleting this mutation until resolved.
          }
        } else {
          // No conflict, apply mutation directly
          await this.applyMutation(mutation);
        }
        
        // This is where the actual sync attempt would happen.
        // We'll simulate a random failure for demonstration.
        if (Math.random() < 0.3) { // 30% chance of failure
            throw new Error('Simulated server error');
        }

        // If successful:
        await db.deleteMutation(mutation.id);
        console.log(`Successfully processed and deleted mutation #${mutation.id}`);

      } catch (error) {
        console.error(`Failed to process mutation #${mutation.id}:`, error);
        
        const newRetryCount = mutation.retries + 1;
        
        if (newRetryCount > MAX_RETRIES) {
          console.log(`Mutation #${mutation.id} has failed too many times. Moving to dead-letter queue.`);
          await db.moveToDeadLetterQueue(mutation);
        } else {
          console.log(`Incrementing retry count for mutation #${mutation.id} to ${newRetryCount}.`);
          await db.updateMutationRetries(mutation.id, newRetryCount);
        }
      }
    }
    
    this.emit('sync-completed');
    this.checkQueue();
  }

  // This would call the appropriate db method based on mutation.type
  private async applyMutation(mutation: any) {
    const { type, payload } = mutation;
    // In a real app, a mapping or switch statement would call the right db method.
    console.log(`Applying mutation of type ${type} for item:`, payload.id);
    // e.g., await db.saveJournalEntry(payload, { isSyncing: true });
  }

  private hasConflict(local: any, remote: any): boolean {
    // A conflict exists if the items have different updatedAt timestamps.
    // In a real app, you might use version numbers or more sophisticated checks.
    return local.updatedAt !== remote.updatedAt;
  }
  
  private resolveConflict(local: any, remote: any) {
      switch (this.strategy) {
          case 'local-wins':
              return local;
          case 'remote-wins':
              return remote;
          case 'newer-wins':
              return new Date(local.updatedAt) > new Date(remote.updatedAt) ? local : remote;
          case 'manual':
          default:
              return null; // Indicates manual resolution is needed
      }
  }

  // Simulates fetching a "remote" version of an item.
  private async getSimulatedRemoteItem(localItem: any): Promise<any | null> {
    // To simulate a conflict, we'll occasionally return an item with a different timestamp.
    if (Math.random() > 0.5) {
      return null; // No remote item, no conflict
    }
    
    const remoteDate = new Date();
    remoteDate.setMinutes(remoteDate.getMinutes() - 1); // 1 minute older
    
    console.log(`Simulating a remote item for ${localItem.id} with timestamp: ${remoteDate.toISOString()}`);
    
    return {
      ...localItem,
      content: 'This is content from the "server".', // Simulate different content
      updatedAt: remoteDate.toISOString(),
    };
  }

  public getStatus() {
    return { isOnline: this.isOnline };
  }

  public cleanup() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

const syncManager = new SyncManager();
export { syncManager }; 