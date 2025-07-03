import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import * as path from 'path';
import * as ejs from 'ejs';

@Injectable()
export class TemplateCacheService implements OnModuleInit {
  private readonly templateDir = path.resolve(__dirname, '../xml/templates');
  private readonly cache = new Map<string, ejs.TemplateFunction>();

  constructor(private readonly logger: Logger) {}

  async onModuleInit(): Promise<void> {
    const files = await readdir(this.templateDir);
    const ejsFiles = files.filter(f => f.endsWith('.ejs'));

    for (const file of ejsFiles) {
      const content = await readFile(path.join(this.templateDir, file), 'utf-8');
      const name = path.basename(file);
      const compiled = ejs.compile(content, { filename: name });
      this.cache.set(name, compiled);
    }

    this.logger.log(`[TemplateCacheService] ${ejsFiles.length} templates .ejs carregados em cache.`);
  }

  getTemplate(name: string): ejs.TemplateFunction | undefined {
    return this.cache.get(name);
  }
}