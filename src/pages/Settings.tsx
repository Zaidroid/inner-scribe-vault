
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/database';
import { obsidianSync } from '@/lib/obsidian';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Calendar, List, Download, Upload, Trash2 } from 'lucide-react';

const Settings = () => {
  const [obsidianPath, setObsidianPath] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedObsidianPath = await db.getSetting('obsidianPath');
      const savedSyncEnabled = await db.getSetting('syncEnabled');
      const savedAiEnabled = await db.getSetting('aiEnabled');
      const savedOllamaEndpoint = await db.getSetting('ollamaEndpoint');

      if (savedObsidianPath) setObsidianPath(savedObsidianPath);
      if (savedSyncEnabled !== null) setSyncEnabled(savedSyncEnabled);
      if (savedAiEnabled !== null) setAiEnabled(savedAiEnabled);
      if (savedOllamaEndpoint) setOllamaEndpoint(savedOllamaEndpoint);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await db.saveSetting('obsidianPath', obsidianPath);
      await db.saveSetting('syncEnabled', syncEnabled);
      await db.saveSetting('aiEnabled', aiEnabled);
      await db.saveSetting('ollamaEndpoint', ollamaEndpoint);

      // Update Obsidian integration
      obsidianSync.updateConfig({
        vaultPath: obsidianPath,
        enabled: syncEnabled,
      });

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `selfmastery-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          // Import journals
          for (const entry of data.journals || []) {
            await db.saveJournalEntry(entry);
          }
          
          // Import habits
          for (const habit of data.habits || []) {
            await db.saveHabit(habit);
          }
          
          // Import settings
          for (const setting of data.settings || []) {
            await db.saveSetting(setting.key, setting.value);
          }

          toast({
            title: "Data Imported",
            description: "Your data has been restored successfully.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to import data. Please check the file format.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await db.clearAllData();
        toast({
          title: "Data Cleared",
          description: "All data has been permanently deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear data.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTestOllama = async () => {
    try {
      const response = await fetch(`${ollamaEndpoint}/api/version`);
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Ollama is running and accessible.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Ollama",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Ollama. Make sure it's running.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your SelfMastery experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
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
        </motion.div>

        {/* Obsidian Integration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
                  Journal entries will be exported as markdown files
                </p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400">
                  <strong>Sync Status:</strong> {syncEnabled ? 'Enabled' : 'Disabled'}
                </p>
                {syncEnabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Entries will be downloaded as markdown files
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
                    disabled
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
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <List className="h-5 w-5 mr-2" />
              Data Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Download your data as encrypted JSON
                </p>
              </div>

              <div>
                <Button onClick={handleImportData} variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
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
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete all stored data
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Save Settings Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button onClick={saveSettings} className="w-full bg-gradient-primary hover:opacity-90">
          Save All Settings
        </Button>
      </motion.div>

      {/* App Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
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
      </motion.div>
    </motion.div>
  );
};

export default Settings;
