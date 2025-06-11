import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/database';
import { obsidianSync } from '@/lib/obsidian';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Calendar, List, Download, Upload, Trash2 } from 'lucide-react';
import AIProviderConfig from '@/components/AIProviderConfig';
import { VaultConnection } from '@/components/VaultConnection';
import { Settings as VaultSettingsComponent } from '@/components/Settings';
import { SecuritySettings, BackupSettings } from '@/components/SecuritySettings';
import ProfileSettings from '@/components/ProfileSettings';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuditLog } from '@/hooks/useAuditLog';
import HelpTooltip from '@/components/HelpTooltip';

const Settings = () => {
  const [obsidianPath, setObsidianPath] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [isElectronApp, setIsElectronApp] = useState(false);
  
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();

  useEffect(() => {
    // A simple check to see if we're in an Electron renderer process.
    setIsElectronApp(!!(window as any).isElectron);
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedObsidianPath = await db.getSetting('obsidianPath');
      const savedSyncEnabled = await db.getSetting('syncEnabled');

      if (savedObsidianPath) setObsidianPath(savedObsidianPath);
      if (savedSyncEnabled !== null) setSyncEnabled(savedSyncEnabled);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveObsidianSettings = async () => {
    try {
      await db.saveSetting('obsidianPath', obsidianPath);
      await db.saveSetting('syncEnabled', syncEnabled);

      // Update Obsidian integration
      obsidianSync.updateConfig({
        vaultPath: obsidianPath,
        enabled: syncEnabled,
      });

      await addAuditLog('obsidian_settings_saved');
      toast({
        title: "Obsidian Settings Saved",
        description: "Your Obsidian integration preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Obsidian settings.",
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

      await addAuditLog('data_exported');
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

          await addAuditLog('data_imported', { file_name: file.name });
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
        await addAuditLog('data_cleared');
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your SelfMastery experience</p>
      </div>

      <ProfileSettings />

      <LanguageSwitcher />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AIProviderConfig />
        </motion.div>

        {/* Obsidian Integration */}
        {isElectronApp && (
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
                  <div className="flex items-center">
                    <Label htmlFor="sync-enabled">Enable Vault Sync</Label>
                    <HelpTooltip>
                      When enabled, your journal entries will be automatically saved as markdown files in your chosen Obsidian vault.
                    </HelpTooltip>
                  </div>
                  <Switch
                    id="sync-enabled"
                    checked={syncEnabled}
                    onCheckedChange={setSyncEnabled}
                  />
                </div>

                <div>
                  <div className="flex items-center">
                    <Label htmlFor="obsidian-path" className="mb-2 block">Vault Path</Label>
                    <HelpTooltip>
                      Provide the full path to your local Obsidian vault. The app needs this to read and write files.
                    </HelpTooltip>
                  </div>
                  <input
                    id="obsidian-path"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="/path/to/your/obsidian/vault"
                    value={obsidianPath}
                    onChange={(e) => setObsidianPath(e.target.value)}
                    disabled={!syncEnabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Journal entries will be exported as markdown files
                  </p>
                </div>

                <Button 
                  onClick={saveObsidianSettings}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Save Obsidian Settings
                </Button>

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
        )}

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
                <div className="flex items-center">
                  <Label htmlFor="encryption-enabled">Local Encryption</Label>
                  <HelpTooltip>
                    Your data is always encrypted at rest on your local device using AES-256. This setting cannot be disabled.
                  </HelpTooltip>
                </div>
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
                  and stored locally on your device. Nothing is sent to external servers unless you use API-based AI providers.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-medium mb-2">Storage Info</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Journal entries: Encrypted locally</p>
                  <p>• Habits data: Encrypted locally</p>
                  <p>• Goals: Encrypted locally</p>
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
                <div className="flex items-center justify-between w-full">
                  <Button onClick={handleExportData} variant="outline" className="flex-grow">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <HelpTooltip>
                    Download all your application data into a single, encrypted JSON file. Keep this file safe as a backup.
                  </HelpTooltip>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Download your data as encrypted JSON
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between w-full">
                  <Button onClick={handleImportData} variant="outline" className="flex-grow">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <HelpTooltip>
                    Restore your data from a previously exported backup file. This will overwrite existing data.
                  </HelpTooltip>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Restore from a previous export
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between w-full">
                  <Button 
                    onClick={handleClearData} 
                    variant="destructive" 
                    className="flex-grow"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                  <HelpTooltip>
                    Warning: This will permanently delete all your data from this application. This action cannot be undone.
                  </HelpTooltip>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete all stored data
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* New Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-6"
      >
        <SecuritySettings />
        <BackupSettings />
      </motion.div>

      {/* Advanced Vault Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            Advanced Vault Management
          </h3>
          <div className="space-y-6">
            <VaultConnection />
            <VaultSettingsComponent />
          </div>
        </Card>
      </motion.div>

      {/* App Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">About SelfMastery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Version</p>
              <p className="text-muted-foreground">1.0.0 (Beta)</p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">January 2025</p>
            </div>
            <div>
              <p className="font-medium">Data Location</p>
              <p className="text-muted-foreground">Local Device Storage</p>
            </div>
            <div>
              <p className="font-medium">Privacy</p>
              <p className="text-muted-foreground">Local + Optional Cloud AI</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
