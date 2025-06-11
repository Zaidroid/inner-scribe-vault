import { ObsidianPlugin, PluginManager, PluginContext } from './types';
import { VaultPluginError, VaultError } from '../errors';

export class ObsidianPluginManager implements PluginManager {
  private plugins: Map<string, ObsidianPlugin> = new Map();
  private context?: PluginContext;

  registerPlugin(plugin: ObsidianPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new VaultPluginError(`Plugin with ID ${plugin.id} is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      try {
        plugin.cleanup?.();
      } catch (err) {
        throw new VaultPluginError(err instanceof Error ? err.message : `Failed to cleanup plugin ${pluginId}`);
      }
      this.plugins.delete(pluginId);
    }
  }

  getPlugin(pluginId: string): ObsidianPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getEnabledPlugins(): ObsidianPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => 
      plugin.initialize && this.context?.config.enabled
    );
  }

  async initializePlugins(context: PluginContext): Promise<void> {
    this.context = context;
    const enabledPlugins = this.getEnabledPlugins();
    
    for (const plugin of enabledPlugins) {
      try {
        await plugin.initialize?.(context);
      } catch (err) {
        throw new VaultPluginError(`Failed to initialize plugin ${plugin.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  async cleanupPlugins(): Promise<void> {
    const enabledPlugins = this.getEnabledPlugins();
    
    for (const plugin of enabledPlugins) {
      try {
        await plugin.cleanup?.();
      } catch (err) {
        throw new VaultPluginError(`Failed to cleanup plugin ${plugin.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
} 