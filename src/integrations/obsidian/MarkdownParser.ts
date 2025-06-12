import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { VaultFile } from './types';

export interface ParsedMarkdown {
  content: string;
  frontmatter: Record<string, any>;
  links: ObsidianLink[];
  tags: string[];
  headings: Heading[];
}

export interface ObsidianLink {
  type: 'internal' | 'external';
  path: string;
  displayText?: string;
  alias?: string;
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export class MarkdownParser {
  private processor: any;

  constructor() {
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkRehype)
      .use(rehypeStringify);
  }

  async parse(file: VaultFile): Promise<ParsedMarkdown> {
    try {
      const result = await this.processor.process(file.content);
      const ast = result.ast;

      return {
        content: result.toString(),
        frontmatter: this.extractFrontmatter(ast),
        links: this.extractLinks(ast),
        tags: this.extractTags(ast),
        headings: this.extractHeadings(ast)
      };
    } catch (error) {
      throw new Error(`Failed to parse markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractFrontmatter(ast: any): Record<string, any> {
    const frontmatterNode = ast.children.find((node: any) => 
      node.type === 'yaml' || node.type === 'toml'
    );

    if (!frontmatterNode) {
      return {};
    }

    try {
      return JSON.parse(frontmatterNode.value);
    } catch {
      return {};
    }
  }

  private extractLinks(ast: any): ObsidianLink[] {
    const links: ObsidianLink[] = [];

    const processNode = (node: any) => {
      if (node.type === 'link') {
        const url = node.url;
        const isInternal = !url.startsWith('http://') && !url.startsWith('https://');
        
        links.push({
          type: isInternal ? 'internal' : 'external',
          path: url,
          displayText: node.children?.[0]?.value,
          alias: node.title
        });
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    ast.children.forEach(processNode);
    return links;
  }

  private extractTags(ast: any): string[] {
    const tags: string[] = [];

    const processNode = (node: any) => {
      if (node.type === 'text' && node.value.includes('#')) {
        const tagMatches = node.value.match(/#[\w-]+/g);
        if (tagMatches) {
          tags.push(...tagMatches.map((tag: string) => tag.slice(1)));
        }
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    ast.children.forEach(processNode);
    return [...new Set(tags)]; // Remove duplicates
  }

  private extractHeadings(ast: any): Heading[] {
    const headings: Heading[] = [];

    const processNode = (node: any) => {
      if (node.type === 'heading') {
        const text = node.children
          .map((child: any) => child.value || '')
          .join('')
          .trim();

        headings.push({
          level: node.depth,
          text,
          id: this.generateHeadingId(text)
        });
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    ast.children.forEach(processNode);
    return headings;
  }

  private generateHeadingId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async stringify(parsed: ParsedMarkdown): Promise<string> {
    try {
      // Convert the parsed content back to markdown
      const result = await this.processor.process(parsed.content);
      return result.toString();
    } catch (error) {
      throw new Error(`Failed to stringify markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 