import React, { useState, useEffect } from 'react';
import { useVault } from '../hooks/useVault';
import { VaultSettings, VaultConfigValidation } from '../integrations/obsidian/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { syncManager } from '../lib/sync';
import { DeadLetterQueue } from './DeadLetterQueue';

const DEFAULT_SETTINGS: VaultSettings = {
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

export function VaultConfig() {
  const { connectionStatus, error, enabledPlugins, getPluginSettings, updatePluginSettings } = useVault();
  const [settings, setSettings] = useState<VaultSettings>(DEFAULT_SETTINGS);
  const [validation, setValidation] = useState<VaultConfigValidation>({ isValid: true, errors: {} });
  const [activeTab, setActiveTab] = useState('sync');

  useEffect(() => {
    // Load plugin settings when plugins change
    const loadPluginSettings = async () => {
      const pluginSettings: Record<string, Record<string, any>> = {};
      for (const plugin of enabledPlugins) {
        pluginSettings[plugin.id] = await getPluginSettings(plugin.id);
      }
      setSettings(prev => ({
        ...prev,
        plugins: {
          ...prev.plugins,
          settings: pluginSettings
        }
      }));
    };

    loadPluginSettings();
  }, [enabledPlugins, getPluginSettings]);

  const validateSettings = (newSettings: VaultSettings): VaultConfigValidation => {
    const errors: VaultConfigValidation['errors'] = {};

    // Validate sync settings
    if (newSettings.sync.enabled) {
      if (newSettings.sync.interval < 1000) {
        errors.settings = { ...errors.settings, sync: 'Sync interval must be at least 1 second' };
      }
    }

    // Validate backup settings
    if (newSettings.backup.enabled) {
      if (newSettings.backup.interval < 60000) {
        errors.settings = { ...errors.settings, backup: 'Backup interval must be at least 1 minute' };
      }
      if (newSettings.backup.maxBackups < 1) {
        errors.settings = { ...errors.settings, backup: 'Must keep at least 1 backup' };
      }
      if (!newSettings.backup.backupPath) {
        errors.settings = { ...errors.settings, backup: 'Backup path is required' };
      }
    }

    // Validate editor settings
    if (newSettings.editor.autosave && newSettings.editor.autosaveInterval < 500) {
      errors.settings = { ...errors.settings, editor: 'Autosave interval must be at least 500ms' };
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSettingChange = (section: keyof VaultSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };

    const validation = validateSettings(newSettings);
    setValidation(validation);
    if (validation.isValid) {
      setSettings(newSettings);
    }
    
    // Update the sync manager for strategy changes
    if (section === 'sync' && key === 'strategy') {
      syncManager.setStrategy(value);
    }
    
    // Update the sync manager for background sync changes
    if (section === 'sync' && (key === 'autoSync' || key === 'interval')) {
      const isEnabled = key === 'autoSync' ? value : newSettings.sync.autoSync;
      const syncInterval = key === 'interval' ? value : newSettings.sync.interval;
      syncManager.configure({ enabled: isEnabled, interval: syncInterval });
    }
  };

  const handlePluginSettingChange = async (pluginId: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      plugins: {
        ...settings.plugins,
        settings: {
          ...settings.plugins.settings,
          [pluginId]: {
            ...settings.plugins.settings[pluginId],
            [key]: value
          }
        }
      }
    };

    setSettings(newSettings);
    await updatePluginSettings(pluginId, newSettings.plugins.settings[pluginId]);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vault Configuration</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="watcher">File Watcher</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sync-issues">Sync Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Sync</label>
              <Switch
                checked={settings.sync.enabled}
                onCheckedChange={(checked) => handleSettingChange('sync', 'enabled', checked)}
              />
            </div>
            {settings.sync.enabled && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sync Interval (ms)</label>
                  <Input
                    type="number"
                    value={settings.sync.interval}
                    onChange={(e) => handleSettingChange('sync', 'interval', parseInt(e.target.value))}
                    min={1000}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sync Strategy</label>
                  <Select
                    value={settings.sync.strategy}
                    onValueChange={(value) => handleSettingChange('sync', 'strategy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app-wins">App Wins</SelectItem>
                      <SelectItem value="vault-wins">Vault Wins</SelectItem>
                      <SelectItem value="newer-wins">Newer Wins</SelectItem>
                      <SelectItem value="manual">Manual Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Background Sync</label>
                  <Switch
                    checked={settings.sync.autoSync}
                    onCheckedChange={(checked) => handleSettingChange('sync', 'autoSync', checked)}
                  />
                </div>
                {settings.sync.autoSync && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Background Sync Interval (ms)</label>
                    <Input
                      type="number"
                      value={settings.sync.interval}
                      onChange={(e) => handleSettingChange('sync', 'interval', parseInt(e.target.value))}
                      min={10000} // Set a reasonable minimum, e.g., 10 seconds
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plugins">
          <div className="space-y-4">
            {enabledPlugins.map((plugin) => (
              <div key={plugin.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{plugin.name}</h3>
                {settings.plugins.settings[plugin.id] && (
                  <div className="space-y-2">
                    {Object.entries(settings.plugins.settings[plugin.id]).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium mb-1 block">{key}</label>
                        {typeof value === 'boolean' ? (
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => handlePluginSettingChange(plugin.id, key, checked)}
                          />
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => handlePluginSettingChange(plugin.id, key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="watcher">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable File Watcher</label>
              <Switch
                checked={settings.watcher.enabled}
                onCheckedChange={(checked) => handleSettingChange('watcher', 'enabled', checked)}
              />
            </div>
            {settings.watcher.enabled && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Ignore Patterns</label>
                  <Input
                    value={settings.watcher.ignorePatterns.join(', ')}
                    onChange={(e) => handleSettingChange('watcher', 'ignorePatterns', e.target.value.split(',').map(p => p.trim()))}
                    placeholder="Enter patterns separated by commas"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Debounce Time (ms)</label>
                  <Input
                    type="number"
                    value={settings.watcher.debounceTime}
                    onChange={(e) => handleSettingChange('watcher', 'debounceTime', parseInt(e.target.value))}
                    min={100}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Backup</label>
              <Switch
                checked={settings.backup.enabled}
                onCheckedChange={(checked) => handleSettingChange('backup', 'enabled', checked)}
              />
            </div>
            {settings.backup.enabled && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Backup Interval (ms)</label>
                  <Input
                    type="number"
                    value={settings.backup.interval}
                    onChange={(e) => handleSettingChange('backup', 'interval', parseInt(e.target.value))}
                    min={60000}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Backups</label>
                  <Input
                    type="number"
                    value={settings.backup.maxBackups}
                    onChange={(e) => handleSettingChange('backup', 'maxBackups', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Backup Path</label>
                  <Input
                    value={settings.backup.backupPath}
                    onChange={(e) => handleSettingChange('backup', 'backupPath', e.target.value)}
                    placeholder="Enter backup directory path"
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="editor">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Default View</label>
              <Select
                value={settings.editor.defaultView}
                onValueChange={(value) => handleSettingChange('editor', 'defaultView', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="source">Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Numbers</label>
              <Switch
                checked={settings.editor.lineNumbers}
                onCheckedChange={(checked) => handleSettingChange('editor', 'lineNumbers', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Spellcheck</label>
              <Switch
                checked={settings.editor.spellcheck}
                onCheckedChange={(checked) => handleSettingChange('editor', 'spellcheck', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Autosave</label>
              <Switch
                checked={settings.editor.autosave}
                onCheckedChange={(checked) => handleSettingChange('editor', 'autosave', checked)}
              />
            </div>
            {settings.editor.autosave && (
              <div>
                <label className="text-sm font-medium mb-1 block">Autosave Interval (ms)</label>
                <Input
                  type="number"
                  value={settings.editor.autosaveInterval}
                  onChange={(e) => handleSettingChange('editor', 'autosaveInterval', parseInt(e.target.value))}
                  min={500}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sync-issues">
          <DeadLetterQueue />
        </TabsContent>
      </Tabs>

      {!validation.isValid && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {Object.entries(validation.errors)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <div key={key}>{value}</div>
              ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          Reset to Defaults
        </Button>
        <Button onClick={() => {/* TODO: Save settings */}}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
} 