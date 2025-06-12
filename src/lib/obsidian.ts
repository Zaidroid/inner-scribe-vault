// This file re-exports the services. Vite's aliasing will ensure
// that the correct version (real or mock) is imported based on the build environment.

import { SyncService } from '@/integrations/obsidian/SyncService';

// Create a single, shared instance of the SyncService.
const obsidianSync = new SyncService();

export { obsidianSync };
