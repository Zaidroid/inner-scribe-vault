export class MarkdownParser {
  async parse(file: any): Promise<any> {
    return Promise.resolve({
      content: file.content || '',
      frontmatter: {},
      links: [],
      tags: [],
      headings: [],
    });
  }

  async stringify(parsed: any): Promise<string> {
    return Promise.resolve(parsed.content || '');
  }
} 