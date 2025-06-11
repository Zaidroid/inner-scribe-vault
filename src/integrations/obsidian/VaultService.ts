import { VaultConfig, VaultFile, VaultConnectionStatus, VaultSyncOptions, VaultSettings, VaultConfigValidation } from './types';
import { EventEmitter } from 'eventemitter3';
import { VaultWatcher, FileChangeEvent } from './VaultWatcher';
import { MarkdownParser, ParsedMarkdown } from './MarkdownParser';
import { SyncService, SyncState, PendingChange } from './SyncService';
import { ObsidianPluginManager } from './plugins/PluginManager';
import { DataviewPlugin } from './plugins/DataviewPlugin';
import { CalloutsPlugin } from './plugins/CalloutsPlugin';
import { VaultError, VaultConnectionError, VaultConfigError } from './errors';

export class VaultService extends EventEmitter {
  private config: VaultConfig | null = null;
  private syncOptions: VaultSyncOptions = {
    syncInterval: 5000,
    autoSync: true,
    syncOnChange: true
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private watcher: VaultWatcher;
  private parser: MarkdownParser;
  private syncService: SyncService;
  private pluginManager: ObsidianPluginManager;
  private settings: VaultSettings;
  private backupInterval: NodeJS.Timeout | null = null;
  private backupHistory: string[] = [];

  constructor() {
    super();
    this.watcher = new VaultWatcher();
    this.parser = new MarkdownParser();
    this.syncService = new SyncService();
    this.pluginManager = new ObsidianPluginManager();
    this.settings = this.getDefaultSettings();
    
    // Register default plugins
    this.pluginManager.registerPlugin(new DataviewPlugin());
    this.pluginManager.registerPlugin(new CalloutsPlugin());
    
    this.setupWatcherEvents();
    this.setupSyncEvents();
  }

  private setupWatcherEvents(): void {
    this.watcher.on('file-change', async (event: FileChangeEvent) => {
      if (this.syncOptions.syncOnChange) {
        await this.sync();
      }
      this.emit('file-changed', event);
    });

    this.watcher.on('watching-error', (error: Error) => {
      this.emit('watch-error', error);
    });
  }

  private setupSyncEvents(): void {
    this.syncService.on('sync-started', () => {
      this.emit('sync-started');
    });

    this.syncService.on('sync-completed', (data) => {
      this.emit('sync-completed', data);
    });

    this.syncService.on('sync-error', (error: Error) => {
      this.emit('sync-error', error);
    });

    this.syncService.on('conflicts-detected', (conflicts: PendingChange[]) => {
      this.emit('conflicts-detected', conflicts);
    });
  }

  private getDefaultSettings(): VaultSettings {
    return {
      sync: {
        enabled: true,
        interval: 5000,
        strategy: 'newer-wins',
        autoSync: true
      },
      plugins: {
        enabled: [],
        settings: {}
      },
      watcher: {
        enabled: true,
        ignorePatterns: ['.git', 'node_modules'],
        debounceTime: 1000
      },
      backup: {
        enabled: false,
        interval: 3600000, // 1 hour
        maxBackups: 5,
        backupPath: ''
      },
      editor: {
        defaultView: 'preview',
        lineNumbers: true,
        spellcheck: true,
        autosave: true,
        autosaveInterval: 1000
      }
    };
  }

  async connect(config: VaultConfig): Promise<void> {
    // Validate config
    if (!config.path || !config.name) {
      throw new VaultConnectionError('Vault path and name are required');
    }
    if (typeof config.path !== 'string' || typeof config.name !== 'string') {
      throw new VaultConfigError('Vault path and name must be strings');
    }
    try {
      this.config = config;
      this.settings = config.settings || this.getDefaultSettings();

      // Initialize plugins
      await this.pluginManager.initializePlugins({
        vaultPath: config.path,
        config: { enabled: true }
      });

      // Start file watcher if enabled
      if (this.settings.watcher.enabled) {
        this.startWatcher();
      }

      // Start auto-sync if enabled
      if (this.settings.sync.enabled && this.settings.sync.autoSync) {
        this.startAutoSync();
      }

      // Start backup if enabled
      if (this.settings.backup.enabled) {
        this.startBackup();
      }

      this.emit('connected', config);
    } catch (err) {
      throw new VaultConnectionError(
        err instanceof Error ? err.message : 'Failed to connect to vault'
      );
    }
  }

  async disconnect(): Promise<void> {
    // Stop all services
    this.stopWatcher();
    this.stopAutoSync();
    this.stopBackup();
    await this.pluginManager.cleanupPlugins();

    this.config = null;
    this.emit('disconnected');
  }

  private startWatcher() {
    if (this.config?.path) {
      this.watcher.startWatching(this.config.path);
    }
  }

  private stopWatcher() {
    this.watcher.stopWatching();
  }

  private startAutoSync() {
    if (this.settings.sync.enabled && this.settings.sync.autoSync) {
      setInterval(() => {
        this.sync();
      }, this.settings.sync.interval);
    }
  }

  private stopAutoSync() {
    // Clear any existing intervals
    // Implementation depends on how you're managing intervals
  }

  private startBackup() {
    this.stopBackup();
    if (this.settings.backup.enabled) {
      this.backupInterval = setInterval(() => {
        this.createBackup();
      }, this.settings.backup.interval);
    }
  }

  private stopBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  async triggerBackup(): Promise<void> {
    await this.createBackup();
  }

  private async createBackup() {
    if (!this.config?.path || !this.settings.backup.enabled) return;
    this.emit('backup-started');
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${this.settings.backup.backupPath}/backup-${timestamp}`;
      // Create backup directory
      await window.electron.fs.mkdir(backupPath, { recursive: true });
      // Copy vault contents to backup
      await window.electron.fs.cp(this.config.path, backupPath, { recursive: true });
      // Clean up old backups
      const backups = await window.electron.fs.readdir(this.settings.backup.backupPath);
      if (backups.length > this.settings.backup.maxBackups) {
        const oldBackups = backups
          .sort()
          .slice(0, backups.length - this.settings.backup.maxBackups);
        for (const backup of oldBackups) {
          await window.electron.fs.rm(`${this.settings.backup.backupPath}/${backup}`, { recursive: true });
        }
      }
      this.backupHistory.push(backupPath);
      this.emit('backup-completed', backupPath);
    } catch (error) {
      this.emit('backup-error', error);
      throw new VaultError(error instanceof Error ? error.message : 'Backup failed');
    }
  }

  getBackupHistory(): string[] {
    return this.backupHistory;
  }

  async updateSettings(settings: Partial<VaultSettings>): Promise<void> {
    const newSettings = { ...this.settings, ...settings };
    const validation = this.validateSettings(newSettings);
    if (!validation.isValid) {
      throw new VaultConfigError('Invalid settings: ' + JSON.stringify(validation.errors));
    }
    this.settings = newSettings;

    // Update services based on new settings
    if (settings.sync) {
      this.stopAutoSync();
      if (settings.sync.enabled && settings.sync.autoSync) {
        this.startAutoSync();
      }
    }

    if (settings.watcher) {
      this.stopWatcher();
      if (settings.watcher.enabled) {
        this.startWatcher();
      }
    }

    if (settings.backup) {
      this.stopBackup();
      if (settings.backup.enabled) {
        this.startBackup();
      }
    }

    this.emit('settingsUpdated', this.settings);
  }

  private validateSettings(settings: VaultSettings): VaultConfigValidation {
    const errors: VaultConfigValidation['errors'] = {};

    // Validate sync settings
    if (settings.sync.enabled) {
      if (settings.sync.interval < 1000) {
        errors.settings = { ...errors.settings, sync: 'Sync interval must be at least 1 second' };
      }
    }

    // Validate backup settings
    if (settings.backup.enabled) {
      if (settings.backup.interval < 60000) {
        errors.settings = { ...errors.settings, backup: 'Backup interval must be at least 1 minute' };
      }
      if (settings.backup.maxBackups < 1) {
        errors.settings = { ...errors.settings, backup: 'Must keep at least 1 backup' };
      }
      if (!settings.backup.backupPath) {
        errors.settings = { ...errors.settings, backup: 'Backup path is required' };
      }
    }

    // Validate editor settings
    if (settings.editor.autosave && settings.editor.autosaveInterval < 500) {
      errors.settings = { ...errors.settings, editor: 'Autosave interval must be at least 500ms' };
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  getSettings(): VaultSettings {
    return this.settings;
  }

  async sync(): Promise<void> {
    if (!this.config?.isConnected) {
      throw new Error('Vault is not connected');
    }

    await this.syncService.sync(this.config.path);
  }

  async getFile(path: string): Promise<VaultFile> {
    if (!this.config?.path) {
      throw new VaultConnectionError('Vault is not connected');
    }
    try {
      const response = await window.electron.ipcRenderer.invoke('get-vault-file', {
        vaultPath: this.config.path,
        filePath: path
      });

      return response;
    } catch (err) {
      throw new VaultError(err instanceof Error ? err.message : 'Failed to get file');
    }
  }

  async getParsedFile(path: string): Promise<ParsedMarkdown> {
    const file = await this.getFile(path);
    const parsed = await this.parser.parse(file.content);
    
    // Process content through enabled plugins
    const enabledPlugins = this.pluginManager.getEnabledPlugins();
    let processedContent = parsed;
    
    for (const plugin of enabledPlugins) {
      if (plugin.processContent) {
        processedContent = await plugin.processContent(processedContent);
      }
    }
    
    return processedContent;
  }

  async saveFile(path: string, content: string): Promise<void> {
    if (!this.config?.path) {
      throw new VaultConnectionError('Vault is not connected');
    }
    try {
      // Add to pending changes
      this.syncService.addPendingChange({
        type: 'update',
        path: path,
        content: content,
        source: 'app'
      });

      // If auto-sync is enabled, trigger a sync
      if (this.settings.sync.enabled && this.settings.sync.autoSync) {
        await this.sync();
      }

      this.emit('file-saved', { path, content });
    } catch (err) {
      throw new VaultError(err instanceof Error ? err.message : 'Failed to save file');
    }
  }

  async saveParsedFile(path: string, parsed: ParsedMarkdown): Promise<void> {
    // Process content through enabled plugins in reverse order
    const enabledPlugins = this.pluginManager.getEnabledPlugins().reverse();
    let processedContent = parsed;
    
    for (const plugin of enabledPlugins) {
      if (plugin.processContent) {
        processedContent = await plugin.processContent(processedContent);
      }
    }
    
    const content = this.parser.stringify(processedContent);
    await this.saveFile(path, content);
  }

  setSyncOptions(options: Partial<VaultSyncOptions>): void {
    this.syncOptions = {
      ...this.syncOptions,
      ...options
    };

    this.syncService.setOptions({
      syncInterval: this.syncOptions.syncInterval,
      autoSync: this.syncOptions.autoSync,
      syncOnChange: this.syncOptions.syncOnChange
    });

    if (this.syncOptions.autoSync) {
      this.startAutoSync();
    } else if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getSyncState(): SyncState {
    return this.syncService.getState();
  }

  getWatcherStatus(): { isActive: boolean; vaultPath: string | null } {
    return {
      isActive: this.watcher.isActive(),
      vaultPath: this.watcher.getVaultPath()
    };
  }

  getConnectionStatus(): VaultConnectionStatus {
    if (!this.config) {
      return { isConnected: false };
    }

    return {
      isConnected: this.config.isConnected,
      lastSync: this.config.lastSync
    };
  }

  private async validateVaultPath(path: string): Promise<boolean> {
    try {
      const response = await window.electron.ipcRenderer.invoke('validate-vault-path', path);
      return response.valid;
    } catch (error) {
      console.error('Error validating vault path:', error);
      return false;
    }
  }

  // Plugin management methods
  getEnabledPlugins() {
    return this.pluginManager.getEnabledPlugins();
  }

  async enablePlugin(pluginId: string) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    if (plugin) {
      await this.pluginManager.initializePlugins({
        vaultPath: this.config?.path || '',
        config: { enabled: true }
      });
    }
  }

  async disablePlugin(pluginId: string) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    if (plugin) {
      await plugin.cleanup?.();
    }
  }

  async getPluginSettings(pluginId: string) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    return plugin?.getSettings?.() || {};
  }

  async updatePluginSettings(pluginId: string, settings: Record<string, any>) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    await plugin?.updateSettings?.(settings);
  }
} 