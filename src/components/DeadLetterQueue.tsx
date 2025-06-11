import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

// Assuming Mutation interface is exported from database.ts
// If not, it should be defined here or in a shared types file.
interface Mutation {
    id: number;
    type: string;
    payload: any;
    timestamp: number;
    retries: number;
}

export function DeadLetterQueue() {
  const [deadMutations, setDeadMutations] = useState<Mutation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDeadMutations = async () => {
    try {
      const mutations = await db.getDeadLetterMutations();
      setDeadMutations(mutations);
    } catch (err) {
      setError('Failed to load failed syncs.');
    }
  };

  useEffect(() => {
    loadDeadMutations();
  }, []);

  const handleRetry = async (mutation: Mutation) => {
    try {
      // Logic to move from dead_mutations back to mutations queue
      // This requires a new method in `database.ts`
      await db.retryDeadMutation(mutation);
      loadDeadMutations(); // Refresh the list
    } catch (err) {
      setError('Failed to retry sync.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Logic to permanently delete from dead_mutations
      // This requires a new method in `database.ts`
      await db.deleteDeadMutation(id);
      loadDeadMutations(); // Refresh the list
    } catch (err) {
      setError('Failed to delete failed sync.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failed Sync Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          These operations failed to sync multiple times. You can manually retry or delete them.
        </p>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-4">
          {deadMutations.length === 0 && <p className="text-sm text-muted-foreground">No failed operations.</p>}
          {deadMutations.map(mutation => (
            <div key={mutation.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{mutation.type}</p>
                <pre className="text-xs bg-muted p-2 rounded-md mt-2">{JSON.stringify(mutation.payload, null, 2)}</pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleRetry(mutation)}>Retry</Button>
                <Button variant="destructive" onClick={() => handleDelete(mutation.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 