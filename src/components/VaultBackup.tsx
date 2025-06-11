import React from 'react';
import { useVault } from '../hooks/useVault';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function VaultBackup() {
  const { backupHistory, triggerBackup, error } = useVault();

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Vault Backup</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="font-mono text-red-700 whitespace-pre-wrap">{error}</AlertDescription>
          </Alert>
        )}
        <Button onClick={triggerBackup}>Trigger Backup</Button>
        <h3 className="text-lg font-semibold mt-4">Backup History</h3>
        <ul className="mt-2">
          {backupHistory.map((backup, index) => (
            <li key={index} className="font-mono text-sm">{backup}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 