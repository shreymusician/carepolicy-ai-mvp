export interface IrdaiCatalogueEntry {
  uin: string;
  documentUrl: string;
  catalogueUrl: string;
}

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// IRDAI product document links look like:
//   https://irdai.gov.in/documents/{folder}/{sub}/{UIN}.pdf/{guid}?version=..&download=true
// The filename is the UIN, which is what makes automated extraction possible.
const DOCUMENT_LINK = /https:\/\/irdai\.gov\.in\/documents\/\d+\/\d+\/([A-Z]{3,4}[A-Z0-9]{5,}V\d{6})\.pdf[^"'\s<>\\]*/g;

/**
 * Reads IRDAI catalogue pages and extracts approved-product document links.
 * Catalogue URLs are supplied by the caller so additional pages, financial-year
 * archives or future IRDAI listings can be added without touching this class.
 */
export class IrdaiCatalogueClient {
  async fetchEntries(catalogueUrls: string[]): Promise<IrdaiCatalogueEntry[]> {
    const seen = new Map<string, IrdaiCatalogueEntry>();

    for (const catalogueUrl of catalogueUrls) {
      let html: string;
      try {
        html = await this.fetchHtml(catalogueUrl);
      } catch (error) {
        console.warn(`[IRDAI] Could not read catalogue ${catalogueUrl}: ${this.msg(error)}`);
        continue;
      }

      let count = 0;
      for (const match of html.matchAll(DOCUMENT_LINK)) {
        const documentUrl = this.decodeEntities(match[0]);
        const uin = match[1];
        if (!seen.has(uin)) {
          seen.set(uin, { uin, documentUrl, catalogueUrl });
          count++;
        }
      }
      console.log(`[IRDAI] ${catalogueUrl} -> ${count} product document(s)`);
    }

    return [...seen.values()];
  }

  private async fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.text();
  }

  private decodeEntities(url: string): string {
    return url.replace(/&amp;/g, '&');
  }

  private msg(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

export default new IrdaiCatalogueClient();
