export class VaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultError';
  }
}

export class VaultConnectionError extends VaultError {
  constructor(message: string) {
    super(message);
    this.name = 'VaultConnectionError';
  }
}

export class VaultSyncError extends VaultError {
  constructor(message: string) {
    super(message);
    this.name = 'VaultSyncError';
  }
}

export class VaultWatcherError extends VaultError {
  constructor(message: string) {
    super(message);
    this.name = 'VaultWatcherError';
  }
}

export class VaultPluginError extends VaultError {
  constructor(message: string) {
    super(message);
    this.name = 'VaultPluginError';
  }
}

export class VaultConfigError extends VaultError {
  constructor(message: string) {
    super(message);
    this.name = 'VaultConfigError';
  }
} 