import React, { useState } from 'react';
import { VaultConfig } from './VaultConfig';
import { VaultBackup } from './VaultBackup';
import { Button } from './ui/button';

export function Settings() {
  const [showBackup, setShowBackup] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <VaultConfig />
      <Button onClick={() => setShowBackup(!showBackup)}>
        {showBackup ? 'Hide Backup Options' : 'Show Backup Options'}
      </Button>
      {showBackup && <VaultBackup />}
    </div>
  );
} 