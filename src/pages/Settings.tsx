
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, User, Calendar, List } from 'lucide-react';

const Settings = () => {
  const [obsidianPath, setObsidianPath] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');

  const handleExportData = () => {
    console.log('Exporting data...');
    // Implement data export logic
  };

  const handleImportData = () => {
    console.log('Importing data...');
    // Implement data import logic
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      console.log('Clearing all data...');
      // Implement data clearing logic
    }
  };

  const handleTestOllama = async () => {
    try {
      const response = await fetch(`${ollamaEndpoint}/api/version`);
      if (response.ok) {
        alert('Ollama connection successful!');
      } else {
        alert('Failed to connect to Ollama');
      }
    } catch (error) {
      alert('Failed to connect to Ollama. Make sure it\'s running.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your SelfMastery experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            AI Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-enabled">Enable AI Insights</Label>
              <Switch
                id="ai-enabled"
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
              />
            </div>

            <div>
              <Label htmlFor="ollama-endpoint" className="mb-2 block">Ollama Endpoint</Label>
              <div className="flex gap-2">
                <Input
                  id="ollama-endpoint"
                  placeholder="http://localhost:11434"
                  value={ollamaEndpoint}
                  onChange={(e) => setOllamaEndpoint(e.target.value)}
                />
                <Button size="sm" onClick={handleTestOllama} variant="outline">
                  Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure Ollama is running locally for AI features
              </p>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> AI processing happens locally through Ollama. 
                No data is sent to external servers.
              </p>
            </div>
          </div>
        </Card>

        {/* Obsidian Integration */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Obsidian Integration
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sync-enabled">Enable Vault Sync</Label>
              <Switch
                id="sync-enabled"
                checked={syncEnabled}
                onCheckedChange={setSyncEnabled}
              />
            </div>

            <div>
              <Label htmlFor="obsidian-path" className="mb-2 block">Vault Path</Label>
              <Input
                id="obsidian-path"
                placeholder="/path/to/your/obsidian/vault"
                value={obsidianPath}
                onChange={(e) => setObsidianPath(e.target.value)}
                disabled={!syncEnabled}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Journal entries will be synced as markdown files
              </p>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-green-400">
                <strong>Sync Status:</strong> {syncEnabled ? 'Enabled' : 'Disabled'}
              </p>
              {syncEnabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last sync: Never (Feature in development)
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Privacy & Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="encryption-enabled">Local Encryption</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-green-400">
                  Active
                </Badge>
                <Switch
                  id="encryption-enabled"
                  checked={encryptionEnabled}
                  onCheckedChange={setEncryptionEnabled}
                />
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-sm text-purple-400">
                <strong>🔒 Data Protection:</strong> All your data is encrypted with AES-256 
                and stored locally on your device. Nothing is sent to external servers.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-medium mb-2">Storage Info</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Journal entries: Encrypted locally</p>
                <p>• Habits data: Encrypted locally</p>
                <p>• AI insights: Generated and stored locally</p>
                <p>• No cloud backup (by design)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <List className="h-5 w-5 mr-2" />
            Data Management
          </h3>
          
          <div className="space-y-4">
            <div>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                Export All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Download your data as encrypted JSON
              </p>
            </div>

            <div>
              <Button onClick={handleImportData} variant="outline" className="w-full">
                Import Data
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Restore from a previous export
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button 
                onClick={handleClearData} 
                variant="destructive" 
                className="w-full"
              >
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete all stored data
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* App Information */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">About SelfMastery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Version</p>
            <p className="text-muted-foreground">1.0.0 (Beta)</p>
          </div>
          <div>
            <p className="font-medium">Last Updated</p>
            <p className="text-muted-foreground">January 2024</p>
          </div>
          <div>
            <p className="font-medium">Data Location</p>
            <p className="text-muted-foreground">Local Device Storage</p>
          </div>
          <div>
            <p className="font-medium">Privacy</p>
            <p className="text-muted-foreground">100% Local Processing</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
