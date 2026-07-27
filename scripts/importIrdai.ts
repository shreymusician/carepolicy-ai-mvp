import '../src/env';
import mongoose from 'mongoose';
import ConfigService from '../src/config/service';
import IrdaiImporter, { IRDAI_CATALOGUE_URLS } from '../src/services/irdai/IrdaiImporter';

/**
 * Re-runnable IRDAI product import.
 *   npm run import:irdai
 *   npm run import:irdai -- <catalogueUrl> [<catalogueUrl> ...]
 */
async function main(): Promise<void> {
  const urls = process.argv.slice(2).filter(a => a.startsWith('http'));
  const catalogueUrls = urls.length > 0 ? urls : IRDAI_CATALOGUE_URLS;

  await mongoose.connect(ConfigService.database.mongoUri, { dbName: ConfigService.database.dbName });
  console.log('[IRDAI] Connected. Importing from:', catalogueUrls.join(', '));

  const result = await IrdaiImporter.import(catalogueUrls);

  console.log('\n--- IRDAI import summary ---');
  console.log(`discovered: ${result.discovered}`);
  console.log(`created:    ${result.created}`);
  console.log(`updated:    ${result.updated}`);
  console.log(`skipped:    ${result.skipped}`);
  if (result.failures.length > 0) {
    console.log(`failures:   ${result.failures.length}`);
    for (const f of result.failures) console.log(`  - ${f.uin}: ${f.reason}`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('IRDAI import failed:', err);
  process.exit(1);
});
