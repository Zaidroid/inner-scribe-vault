// This file acts as a gateway for Obsidian integration features.
// It conditionally exports the real implementation for Electron
// and a mock/dummy version for the web to prevent bundling Node.js-dependent code.

// This check now uses a build-time variable.
// For the Netlify build (npm run build), IS_ELECTRON will not be set, so this will be false.
// For the Electron build, you will need to set this variable, e.g., "IS_ELECTRON=true npm run build"
const isElectron = process.env.IS_ELECTRON;

class MockSyncManager {
  updateConfig(config: any) {
    console.log("Obsidian integration is not available in the web environment.");
  }
  sync() {
    // Does nothing in the web version
  }
  getStatus() {
    // Return a default non-syncing status
    return { isOnline: navigator.onLine, lastSync: null };
  }
  on(event: string, callback: (...args: any[]) => void) {
    // Does nothing
  }
}

let obsidianSyncInstance: any = new MockSyncManager();

// This function will be called from our application's entry point
export async function initializeObsidianSync() {
  if (isElectron) {
    try {
      const { SyncService } = await import('../integrations/obsidian/SyncService');
      obsidianSyncInstance = new SyncService();
    } catch (err) {
      console.error("Failed to load Obsidian SyncService in Electron:", err);
      // Fallback to mock if dynamic import fails for some reason
      obsidianSyncInstance = new MockSyncManager();
    }
  }
  // If not electron, the instance remains the MockSyncManager
}

// Export the instance. It will be the mock initially and replaced if in Electron.
export { obsidianSyncInstance as obsidianSync };
