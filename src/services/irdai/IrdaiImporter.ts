import InsurancePolicy from '../../models/InsurancePolicy';
import InsuranceCompany from '../../models/InsuranceCompany';
import IrdaiCatalogueClient, { IrdaiCatalogueEntry } from './IrdaiCatalogueClient';
import IrdaiDocumentParser from './IrdaiDocumentParser';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export const IRDAI_CATALOGUE_URLS = ['https://irdai.gov.in/health-insurance-products'];

export interface ImportResult {
  discovered: number;
  created: number;
  updated: number;
  skipped: number;
  failures: Array<{ uin: string; reason: string }>;
}

/**
 * Imports IRDAI-approved health products into the knowledge base.
 *
 * Idempotent: records are keyed on UIN, so re-running refreshes existing products
 * rather than duplicating them. Only fields readable from the official IRDAI
 * document are written; anything unverifiable is left unset.
 */
export class IrdaiImporter {
  async import(catalogueUrls: string[] = IRDAI_CATALOGUE_URLS): Promise<ImportResult> {
    const result: ImportResult = { discovered: 0, created: 0, updated: 0, skipped: 0, failures: [] };

    const entries = await IrdaiCatalogueClient.fetchEntries(catalogueUrls);
    result.discovered = entries.length;

    if (entries.length === 0) {
      console.warn('[IRDAI] No products discovered — leaving existing records untouched.');
      return result;
    }

    const logoByCompany = await this.loadCompanyLogos();

    for (const entry of entries) {
      try {
        const outcome = await this.importOne(entry, logoByCompany);
        if (outcome === 'created') result.created++;
        else if (outcome === 'updated') result.updated++;
        else result.skipped++;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        result.failures.push({ uin: entry.uin, reason });
        console.warn(`[IRDAI] ${entry.uin} failed: ${reason}`);
      }
    }

    return result;
  }

  private async importOne(
    entry: IrdaiCatalogueEntry,
    logoByCompany: Map<string, { id: string; logo?: string; site?: string }>
  ): Promise<'created' | 'updated' | 'skipped'> {
    const buffer = await this.download(entry.documentUrl);
    const parsed = await IrdaiDocumentParser.parse(entry.uin, buffer);

    if (!parsed.companyName || !parsed.productName) {
      // Identity could not be established from the official document — do not guess.
      // If an earlier run stored a record for this UIN, retire it rather than leave
      // unreliable data visible.
      const stale = await InsurancePolicy.findOne({ uin: entry.uin, source_type: 'IRDAI' });
      if (stale) {
        await InsurancePolicy.updateOne(
          { uin: entry.uin },
          { $set: { is_active: false, product_status: 'unknown', updated_at: new Date() } }
        );
        console.warn(`[IRDAI] ${entry.uin}: name not readable, existing record deactivated`);
      } else {
        console.warn(`[IRDAI] ${entry.uin}: could not read product name from document, skipping`);
      }
      return 'skipped';
    }

    const now = new Date();
    const company = logoByCompany.get(this.normalise(parsed.companyName));

    const fields = {
      company_name: parsed.companyName,
      ...(company?.id ? { company_id: company.id } : {}),
      ...(company?.logo ? { company_logo_url: company.logo } : {}),
      ...(company?.site ? { official_website: company.site } : {}),
      policy_name: parsed.productName,
      policy_type: parsed.policyType,
      uin: parsed.uin,
      product_status: 'active' as const,
      official_policy_pdf_url: entry.documentUrl,
      source_url: entry.catalogueUrl,
      source_type: 'IRDAI' as const,
      source_fetched_at: now,
      last_verified_at: now,
      verification_status: 'verified' as const,
      is_active: true,
      updated_at: now
    };

    const existing = await InsurancePolicy.findOne({ uin: parsed.uin });

    if (existing) {
      await InsurancePolicy.updateOne({ uin: parsed.uin }, { $set: fields });
      return 'updated';
    }

    await InsurancePolicy.create({ ...fields, created_at: now });
    return 'created';
  }

  private async loadCompanyLogos(): Promise<Map<string, { id: string; logo?: string; site?: string }>> {
    const companies = await InsuranceCompany.find({});
    const map = new Map<string, { id: string; logo?: string; site?: string }>();
    for (const c of companies) {
      map.set(this.normalise(c.name), {
        id: c._id.toString(),
        logo: c.logo_url,
        site: c.official_website
      });
    }
    return map;
  }

  private async download(url: string): Promise<Buffer> {
    const res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA },
      signal: AbortSignal.timeout(90000)
    });
    if (!res.ok) {
      throw new Error(`document download failed: HTTP ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  private normalise(name: string): string {
    return name.toLowerCase().replace(/[^a-z]/g, '');
  }
}

export default new IrdaiImporter();
