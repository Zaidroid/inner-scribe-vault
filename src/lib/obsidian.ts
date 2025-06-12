// This file re-exports the services. Vite's aliasing will ensure
// that the correct version (real or mock) is imported based on the build environment.

export { SyncService as obsidianSync } from '@/integrations/obsidian/SyncService';
