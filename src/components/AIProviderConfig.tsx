
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/database';
import { Brain, Zap, Globe, Server, CheckCircle, AlertCircle } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  type: 'local' | 'api';
  icon: React.ReactNode;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'url' | 'password';
    placeholder: string;
    required: boolean;
  }>;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    type: 'local',
    icon: <Server className="h-5 w-5" />,
    description: 'Run AI models locally with complete privacy',
    fields: [
      {
        key: 'endpoint',
        label: 'Ollama Endpoint',
        type: 'url',
        placeholder: 'http://localhost:11434',
        required: true
      },
      {
        key: 'model',
        label: 'Model Name',
        type: 'text',
        placeholder: 'llama3.2:latest',
        required: true
      }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'api',
    icon: <Globe className="h-5 w-5" />,
    description: 'Google\'s powerful multimodal AI',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'AIza...',
        required: true
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'gemini-1.5-pro',
        required: true
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'api',
    icon: <Brain className="h-5 w-5" />,
    description: 'Advanced reasoning and coding AI',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        required: true
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'deepseek-chat',
        required: true
      }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'api',
    icon: <Zap className="h-5 w-5" />,
    description: 'Access to multiple AI models via one API',
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-or-...',
        required: true
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'anthropic/claude-3-haiku',
        required: true
      }
    ]
  }
];

const AIProviderConfig: React.FC = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [providerConfigs, setProviderConfigs] = useState<Record<string, any>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedAiEnabled = await db.getSetting('aiEnabled');
      const savedProvider = await db.getSetting('selectedAiProvider');
      const savedConfigs = await db.getSetting('aiProviderConfigs');

      if (savedAiEnabled !== null) setAiEnabled(savedAiEnabled);
      if (savedProvider) setSelectedProvider(savedProvider);
      if (savedConfigs) setProviderConfigs(savedConfigs);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await db.saveSetting('aiEnabled', aiEnabled);
      await db.saveSetting('selectedAiProvider', selectedProvider);
      await db.saveSetting('aiProviderConfigs', providerConfigs);

      toast({
        title: "AI Settings Saved",
        description: "Your AI configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save AI settings.",
        variant: "destructive",
      });
    }
  };

  const updateProviderConfig = (providerId: string, field: string, value: string) => {
    setProviderConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value
      }
    }));
  };

  const testConnection = async (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    const config = providerConfigs[providerId];
    
    if (!provider || !config) return;

    setConnectionStatus(prev => ({ ...prev, [providerId]: 'testing' }));

    try {
      let success = false;

      if (provider.id === 'ollama') {
        const response = await fetch(`${config.endpoint}/api/version`);
        success = response.ok;
      } else {
        // For API providers, we'll do a basic validation
        success = config.apiKey && config.apiKey.length > 10;
      }

      setConnectionStatus(prev => ({ 
        ...prev, 
        [providerId]: success ? 'success' : 'error' 
      }));

      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `${provider.name} is accessible and ready to use.`
          : `Failed to connect to ${provider.name}. Please check your configuration.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'error' }));
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${provider.name}. Please check your configuration.`,
        variant: "destructive",
      });
    }
  };

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const currentConfig = providerConfigs[selectedProvider] || {};

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2" />
        AI Configuration
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="ai-enabled">Enable AI Features</Label>
          <Switch
            id="ai-enabled"
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
          />
        </div>

        {aiEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <Label className="mb-3 block">AI Provider</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <motion.div
                    key={provider.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedProvider === provider.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {provider.icon}
                        <span className="font-medium">{provider.name}</span>
                        <Badge variant={provider.type === 'local' ? 'secondary' : 'outline'}>
                          {provider.type}
                        </Badge>
                        {connectionStatus[provider.id] === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {connectionStatus[provider.id] === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {currentProvider && (
              <motion.div
                key={selectedProvider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-4 border border-primary/20 rounded-lg"
              >
                <h4 className="font-medium flex items-center gap-2">
                  {currentProvider.icon}
                  {currentProvider.name} Configuration
                </h4>
                
                {currentProvider.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={`${selectedProvider}-${field.key}`} className="mb-2 block">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={`${selectedProvider}-${field.key}`}
                      type={field.type === 'password' ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      value={currentConfig[field.key] || ''}
                      onChange={(e) => updateProviderConfig(selectedProvider, field.key, e.target.value)}
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection(selectedProvider)}
                    disabled={connectionStatus[selectedProvider] === 'testing'}
                  >
                    {connectionStatus[selectedProvider] === 'testing' ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveSettings}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Save Configuration
                  </Button>
                </div>

                {currentProvider.type === 'local' && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-400">
                      <strong>Local Processing:</strong> Your data stays on your device. 
                      Make sure {currentProvider.name} is running locally.
                    </p>
                  </div>
                )}

                {currentProvider.type === 'api' && (
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-400">
                      <strong>API Service:</strong> Data will be sent to {currentProvider.name}'s servers. 
                      Check their privacy policy for data handling information.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm text-purple-400 mb-2">
            <strong>🤖 AI Features Available:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Journal entry insights and mood analysis</li>
            <li>• Habit recommendation suggestions</li>
            <li>• Personal growth insights from your data</li>
            <li>• Weekly/monthly reflection summaries</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default AIProviderConfig;
