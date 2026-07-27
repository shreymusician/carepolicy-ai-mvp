import '../src/env';
import mongoose from 'mongoose';
import ConfigService from '../src/config/service';
import KnowledgeExtractionService from '../src/services/knowledge/KnowledgeExtractionService';

/**
 * Builds structured knowledge from official policy documents.
 *   npm run build:knowledge
 *   npm run build:knowledge -- --limit=3
 *   npm run build:knowledge -- --uin=SHAHLIP23017V012223
 *   npm run build:knowledge -- --force
 */
function arg(name: string): string | undefined {
  const hit = process.argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : undefined;
}

async function main(): Promise<void> {
  const limit = arg('limit') ? parseInt(arg('limit') as string, 10) : undefined;
  const uin = arg('uin');
  const force = process.argv.includes('--force');

  await mongoose.connect(ConfigService.database.mongoUri, { dbName: ConfigService.database.dbName });
  console.log('[Knowledge] Connected.', { limit: limit ?? 'all', uin: uin ?? 'any', force });

  const result = await KnowledgeExtractionService.buildForAll({ limit, uin, force });

  console.log('\n--- knowledge build summary ---');
  console.log(`processed: ${result.processed}`);
  console.log(`extracted: ${result.extracted}`);
  console.log(`unchanged: ${result.unchanged}`);
  console.log(`failed:    ${result.failed}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Knowledge build failed:', err);
  process.exit(1);
});
