import { ObsidianPlugin, PluginContext } from './types';
import { ParsedMarkdown } from '../MarkdownParser';

export class CalloutsPlugin implements ObsidianPlugin {
  id = 'callouts';
  name = 'Callouts';
  description = 'Handles Obsidian callout syntax';
  version = '1.0.0';
  author = 'Inner Scribe Team';

  private context?: PluginContext;
  private calloutRegex = /> \[!([a-zA-Z]+)\]([+-])? (.*)/g;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
  }

  async cleanup(): Promise<void> {
    // Cleanup any resources if needed
  }

  async processContent(content: ParsedMarkdown): Promise<ParsedMarkdown> {
    const processedContent = { ...content };
    
    // Process callouts in the content
    if (content.content) {
      processedContent.content = content.content.replace(
        this.calloutRegex,
        (match, type, fold, title) => {
          // Convert callout to HTML
          const foldClass = fold ? ` callout-folded` : '';
          return `<div class="callout callout-${type.toLowerCase()}${foldClass}">
            <div class="callout-title">${title}</div>
            <div class="callout-content">`;
        }
      );
    }

    return processedContent;
  }

  async processFile(filePath: string, content: string): Promise<string> {
    return content.replace(
      this.calloutRegex,
      (match, type, fold, title) => {
        // Convert callout to HTML
        const foldClass = fold ? ` callout-folded` : '';
        return `<div class="callout callout-${type.toLowerCase()}${foldClass}">
          <div class="callout-title">${title}</div>
          <div class="callout-content">`;
      }
    );
  }

  async getSettings(): Promise<Record<string, any>> {
    return this.context?.config.settings || {};
  }

  async updateSettings(settings: Record<string, any>): Promise<void> {
    if (this.context) {
      this.context.config.settings = {
        ...this.context.config.settings,
        ...settings
      };
    }
  }
} 