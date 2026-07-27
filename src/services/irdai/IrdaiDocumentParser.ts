import pdfParse from 'pdf-parse';

export interface ParsedIrdaiDocument {
  uin: string;
  productName?: string;
  companyName?: string;
  policyType: string;
  pageCount?: number;
}

/*
 * UIN prefixes are assigned by IRDAI per insurer and are stable, so they give a
 * reliable display name when the PDF's own text is awkward (legal names are
 * usually rendered in block capitals). The PDF text is still preferred where a
 * clean name can be read from it.
 */
const INSURER_BY_PREFIX: Record<string, string> = {
  ADI: 'Aditya Birla Health Insurance',
  BAJ: 'Bajaj Allianz',
  CHI: 'Care Health Insurance',
  CHO: 'Cholamandalam MS General Insurance',
  EDL: 'Zuno General Insurance',
  FGI: 'Future Generali India Insurance',
  HDF: 'HDFC ERGO',
  ICI: 'ICICI Lombard',
  IFF: 'IFFCO Tokio General Insurance',
  KOT: 'Kotak Mahindra General Insurance',
  MAX: 'Niva Bupa',
  MCI: 'ManipalCigna Health Insurance',
  NAV: 'Navi General Insurance',
  NBH: 'Niva Bupa',
  NIA: 'The New India Assurance',
  ORI: 'The Oriental Insurance Company',
  RAH: 'Raheja QBE General Insurance',
  REL: 'Reliance General Insurance',
  RQB: 'Raheja QBE General Insurance',
  RSA: 'Royal Sundaram General Insurance',
  SBI: 'SBI General Insurance',
  SGL: 'Shriram General Insurance',
  SHA: 'Star Health',
  TAT: 'Tata AIG',
  UII: 'United India Insurance',
  UNI: 'Universal Sompo General Insurance'
};

// Segment 2 of a UIN encodes the product family, e.g. SHA-HLIP-23017-V01-2223.
const TYPE_BY_SEGMENT: Record<string, string> = {
  HLIP: 'individual',
  HLGP: 'group',
  HLGA: 'group_addon',
  HLIA: 'individual_addon',
  HLTP: 'travel',
  TGDP: 'travel',
  TGBP: 'travel',
  PAIP: 'personal_accident',
  PAGP: 'personal_accident'
};

export class IrdaiDocumentParser {
  async parse(uin: string, buffer: Buffer): Promise<ParsedIrdaiDocument> {
    let text = '';
    let pageCount: number | undefined;

    try {
      const data = await pdfParse(buffer);
      text = (data.text || '').replace(/[ \t]+/g, ' ');
      pageCount = data.numpages;
    } catch {
      // Unreadable PDF — identity from the UIN is still valid, everything else stays blank.
    }

    return {
      uin,
      productName: this.extractProductName(text, uin),
      companyName: this.extractCompanyName(text, uin),
      policyType: this.resolvePolicyType(uin),
      pageCount
    };
  }

  private extractProductName(text: string, uin: string): string | undefined {
    if (!text) return undefined;

    // Only explicitly-labelled patterns are trusted. Loose "text near the UIN"
    // matching was tried and produced document boilerplate (section headings,
    // CIN numbers, page markers) — a wrong product name is worse than none.
    const patterns: RegExp[] = [
      // "Product Name: Health Companion | UIN: NBHHLIP23007V052223"
      /Product\s*Name\s*[:\-]\s*([^\n|]{3,70}?)\s*(?:\||UIN|Unique)/i,
      // "Unique Identification No.: SHAHLIP23017V012223Star Health Assure Insurance Policy"
      new RegExp(`${uin}\\s*([A-Z][A-Za-z0-9'&().\\-]*(?:[ ][A-Za-z0-9'&().\\-]+){0,7}?\\s*(?:Policy|Plan|Insurance|Cover))`),
      // "Easy Health UIN: HDFHLIP23024V072223"  (name precedes the UIN)
      new RegExp(`([A-Z][A-Za-z0-9'&().\\-]*(?:[ ][A-Za-z0-9'&().\\-]+){0,6})\\s*(?:\\||-|–)?\\s*UIN\\s*[:\\-]?\\s*${uin}`)
    ];

    for (const re of patterns) {
      const m = text.match(re);
      const value = m?.[1] && this.clean(m[1]);
      if (value && this.looksLikeProductName(value)) return value;
    }
    return undefined;
  }

  private looksLikeProductName(value: string): boolean {
    if (value.length < 4 || value.length > 70) return false;

    // Registration identifiers (CIN / IRDAI numbers) sit near the UIN in some filings.
    if (/^[A-Z]\d{4,}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(value.replace(/\s/g, ''))) return false;
    if (/\d{6,}/.test(value)) return false;

    // Document structure and boilerplate, not product names. No trailing \b so
    // plurals ("Policy Wordings") are caught too.
    const boilerplate =
      /\b(section|preamble|whereas|page\s*(no)?\.?\s*\d|part\s+[ivx]+|annexure|schedule|clause|terms?\s*&?\s*conditions?|policy\s+wording|policy\s+document|definition|table\s+of\s+contents|proposal\s+form|endorsement|grievance)/i;
    if (boilerplate.test(value)) return false;

    // Generic descriptors that carry no product identity on their own.
    if (/^(add[\s-]?on|group|individual|health|policy|plan|cover|benefit)s?$/i.test(value)) return false;

    // A bare company/legal-entity name is not a product name.
    if (/\b(general\s+insurance|insurance\s+co(mpany)?|limited|ltd\.?)\b/i.test(value)) return false;

    // Require at least one proper word (avoids fragments like "Conditions" or "Policy Wording (").
    const words = value.split(/\s+/).filter(w => /[A-Za-z]{2,}/.test(w));
    if (words.length < 2) return false;

    return true;
  }

  private extractCompanyName(text: string, uin: string): string | undefined {
    const mapped = INSURER_BY_PREFIX[uin.slice(0, 3).toUpperCase()];
    if (mapped) return mapped;

    // Fall back to a legal name printed in the document itself.
    const m = text.match(/([A-Z][A-Z&.\s]{8,70}(?:INSURANCE|ASSURANCE)[A-Z&.\s]{0,30}LIMITED)/);
    return m ? this.toTitleCase(this.clean(m[1])) : undefined;
  }

  private resolvePolicyType(uin: string): string {
    const segment = uin.slice(3, 7).toUpperCase();
    return TYPE_BY_SEGMENT[segment] || 'health';
  }

  private clean(value: string): string {
    return value.replace(/\s+/g, ' ').replace(/[|,;:\-–]+$/, '').trim();
  }

  private toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(w => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
      .join(' ');
  }
}

export default new IrdaiDocumentParser();
