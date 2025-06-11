export interface VaultConfig {
  path: string;
  name: string;
  isConnected: boolean;
  settings?: VaultSettings;
  lastSync?: Date;
}

export interface VaultSettings {
  sync: {
    enabled: boolean;
    interval: number; // in milliseconds
    strategy: 'app-wins' | 'vault-wins' | 'newer-wins' | 'manual';
    autoSync: boolean;
  };
  plugins: {
    enabled: string[]; // plugin IDs
    settings: Record<string, Record<string, any>>; // plugin-specific settings
  };
  watcher: {
    enabled: boolean;
    ignorePatterns: string[];
    debounceTime: number; // in milliseconds
  };
  backup: {
    enabled: boolean;
    interval: number; // in milliseconds
    maxBackups: number;
    backupPath: string;
  };
  editor: {
    defaultView: 'preview' | 'source';
    lineNumbers: boolean;
    spellcheck: boolean;
    autosave: boolean;
    autosaveInterval: number; // in milliseconds
  };
}

export interface VaultConfigValidation {
  isValid: boolean;
  errors: {
    path?: string;
    name?: string;
    settings?: {
      sync?: string;
      plugins?: string;
      watcher?: string;
      backup?: string;
      editor?: string;
    };
  };
}

export interface VaultFile {
  path: string;
  content: string;
  lastModified: Date;
  type: 'markdown' | 'image' | 'other';
}

export interface VaultConnectionStatus {
  isConnected: boolean;
  error?: string;
  lastSync?: Date;
}

export interface VaultSyncOptions {
  syncInterval?: number; // in milliseconds
  autoSync?: boolean;
  syncOnChange?: boolean;
} 