import { Injectable, Logger } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import * as path from 'path';

@Injectable()
export class XsdCacheService {
  private readonly xsdDir = path.resolve(__dirname, '../xml/schemas');
  private readonly cache = new Map<string, string>();

  constructor(private readonly logger: Logger) {}

  async onModuleInit(): Promise<void> {
    const files = await readdir(this.xsdDir);
    const xsdFiles = files.filter(f => f.endsWith('.xsd'));

    for (const file of xsdFiles) {
      const content = await readFile(path.join(this.xsdDir, file), 'utf-8');
      const name = path.basename(file, '.xsd');
      this.cache.set(name, content);
    }

    this.logger.log(`[XsdCacheService] ${xsdFiles.length} XSDs carregados em cache.`);
  }

  getSchema(name: string): string | undefined {
    return this.cache.get(name);
  }

  getSchemaPath(name: string): string {
    return path.join(this.xsdDir, `${name}.xsd`);
  }
}