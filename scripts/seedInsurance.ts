import '../src/env';
import mongoose from 'mongoose';
import ConfigService from '../src/config/service';
import InsuranceCompany from '../src/models/InsuranceCompany';
import InsurancePolicy from '../src/models/InsurancePolicy';

/*
 * Insurance knowledge base seed.
 *
 * SOURCING RULE: every content field below is either transcribed from an official
 * insurer document (brochure / Customer Information Sheet / policy wording) fetched
 * from the insurer's own domain, or left undefined. Nothing is inferred or estimated.
 *
 * Records with verification_status 'verified' carry a source_url pointing at the exact
 * official PDF the values were read from. Records marked 'unverified' contain only
 * publicly checkable identity (company, product name, product type, official site) —
 * their descriptive fields are intentionally blank because the source document was not
 * reachable at seed time. Do not fill these in by hand; re-run against the official PDF.
 *
 * Customer-specific data (policy numbers, premiums paid, enrolment dates, riders held,
 * claim history, individual coverage selections) is out of scope by design and must
 * never enter this collection.
 */

interface CompanySeed {
  name: string;
  slug: string;
  logo_url: string;
  official_website: string;
}

interface PolicySeed {
  companySlug: string;
  policy_name: string;
  policy_type: string;
  description?: string;
  coverage_summary?: string;
  waiting_period?: string;
  eligibility?: string;
  sum_insured_range?: { label: string; min_lakhs?: number; max_lakhs?: number };
  target_audience?: string[];
  key_benefits?: string[];
  key_exclusions?: string[];
  official_policy_pdf_url?: string;
  source_url?: string;
  verification_status: 'verified' | 'unverified';
  tags?: string[];
}

const companies: CompanySeed[] = [
  { name: 'Star Health', slug: 'star-health', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=starhealth.in', official_website: 'https://www.starhealth.in' },
  { name: 'Niva Bupa', slug: 'niva-bupa', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=nivabupa.com', official_website: 'https://www.nivabupa.com' },
  { name: 'HDFC ERGO', slug: 'hdfc-ergo', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=hdfcergo.com', official_website: 'https://www.hdfcergo.com' },
  { name: 'ICICI Lombard', slug: 'icici-lombard', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=icicilombard.com', official_website: 'https://www.icicilombard.com' },
  { name: 'Care Health Insurance', slug: 'care-health', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=careinsurance.com', official_website: 'https://www.careinsurance.com' },
  { name: 'Tata AIG', slug: 'tata-aig', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=tataaig.com', official_website: 'https://www.tataaig.com' },
  { name: 'Aditya Birla Health Insurance', slug: 'aditya-birla-health', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=adityabirlacapital.com', official_website: 'https://healthinsurance.adityabirlacapital.com' },
  { name: 'Bajaj Allianz', slug: 'bajaj-allianz', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=bajajallianz.com', official_website: 'https://www.bajajallianz.com' },
  { name: 'SBI General Insurance', slug: 'sbi-general', logo_url: 'https://www.sbigeneral.in/favicon.ico', official_website: 'https://www.sbigeneral.in' },
  { name: 'Reliance General Insurance', slug: 'reliance-general', logo_url: 'https://www.google.com/s2/favicons?sz=128&domain=reliancegeneral.co.in', official_website: 'https://www.reliancegeneral.co.in' }
];

const policies: PolicySeed[] = [
  // ---------- VERIFIED against official insurer PDFs ----------
  {
    companySlug: 'care-health',
    policy_name: 'Care Supreme',
    policy_type: 'family_floater',
    verification_status: 'verified',
    source_url: 'https://cms.careinsurance.com/cms/public/uploads/download_center/care-supreme---brochure.pdf',
    official_policy_pdf_url: 'https://cms.careinsurance.com/cms/public/uploads/download_center/care-supreme---policy-terms-and-conditions.pdf',
    description: 'Care Supreme health insurance plan from Care Health Insurance. UIN: CHIHLIP27061V032627.',
    coverage_summary: 'In-Patient Care, Day Care Treatment, Modern Treatment, ICU Cover, Cumulative Bonus, Road Ambulance Cover, Pre-Hospitalization (up to 60 days) and Post-Hospitalization (up to 180 days) Medical Expenses, AYUSH Treatment up to 100% of Sum Insured, Domiciliary Hospitalization up to 100% of Sum Insured, Organ Donor Cover, Unlimited Automatic Recharge.',
    waiting_period: 'Initial: 30 days. Specified disease/procedure: 24 months. Pre-Existing Diseases: 36 months.',
    eligibility: 'Entry age — Adult: 18 years minimum, lifelong maximum. Child: 90 days minimum, 24 years maximum. Exit age — Adult: lifelong, Child: 25 years. Age of proposer: 18 years or above. Tenure options: 1/2/3 years. Cover type: Individual up to 6 persons, Floater up to 2 adults + 2 children.',
    sum_insured_range: { label: '₹5L / 7L / 10L / 15L / 25L / 50L / 100L (annual)', min_lakhs: 5, max_lakhs: 100 },
    target_audience: ['individual', 'family'],
    key_benefits: [
      'Unlimited Automatic Recharge for related and unrelated illnesses',
      'Up to 60 days pre-hospitalization and 180 days post-hospitalization coverage',
      'AYUSH treatment coverage up to 100% of Sum Insured',
      'Domiciliary Hospitalization up to 100% of Sum Insured',
      'No sub-limits on Modern or Conventional Treatments'
    ],
    tags: ['UIN:CHIHLIP27061V032627']
  },
  {
    companySlug: 'hdfc-ergo',
    policy_name: 'my:Optima Secure',
    policy_type: 'family_floater',
    verification_status: 'verified',
    source_url: 'https://www.hdfcergo.com/docs/default-source/downloads/cis/cis---myoptimasecure.pdf',
    official_policy_pdf_url: 'https://www.hdfcergo.com/docs/default-source/downloads/policy-wordings/health/optima-secure-revision-pw.pdf',
    description: 'my:Optima Secure from HDFC ERGO General Insurance. Product type: both indemnity and benefit. UIN: HDFHLIP25041V062425.',
    coverage_summary: 'Hospitalization Expenses (minimum 24 hours admission, plus all Day Care procedures), Home Health Care, Domiciliary Hospitalization, and AYUSH Treatment (inpatient care under Ayurveda, Yoga and Naturopathy, Unani, Siddha and Homeopathy). Sum Insured available on both Individual and Floater basis, as opted and stated in the Policy Schedule.',
    waiting_period: 'Pre-existing diseases (Excl01): 36 / 24 / 12 months as stipulated in Policy Schedule. Specified disease/procedure (Excl02): 24 months. Initial waiting period (Excl03): 30 days for all illnesses except accidents.',
    target_audience: ['individual', 'family'],
    key_benefits: [
      'Hospitalization expenses including all Day Care procedures',
      'Home Health Care — treatment availed at home',
      'Domiciliary Hospitalization',
      'AYUSH inpatient treatment'
    ],
    key_exclusions: [
      'Investigation & Evaluation — admission primarily for diagnostics/evaluation only (Excl04)',
      'Rest Cure, rehabilitation and respite care — admission primarily for enforced bed rest (Excl05)'
    ],
    tags: ['UIN:HDFHLIP25041V062425']
  },
  {
    companySlug: 'tata-aig',
    policy_name: 'Tata AIG MediCare',
    policy_type: 'individual',
    verification_status: 'verified',
    source_url: 'https://www.tataaig.com/s3/Tata_AIG_Medi_Care_CIS_08824d8e97.pdf',
    official_policy_pdf_url: 'https://www.tataaig.com/s3/Tata_AIG_Medi_Care_CIS_08824d8e97.pdf',
    description: 'Tata AIG MediCare health insurance policy. UIN: TATHLIP26053V042526.',
    waiting_period: 'Initial waiting period: 30 days. Specified disease/procedure: 24 months. Pre-existing disease: 36 months.',
    target_audience: ['individual', 'family'],
    key_exclusions: [
      'Ambulance cover sub-limit: up to ₹3,000 per hospitalisation',
      'Co-payment: 10% applicable if admitted to a room category higher than the eligible category'
    ],
    tags: ['UIN:TATHLIP26053V042526']
  },
  {
    companySlug: 'tata-aig',
    policy_name: 'Tata AIG MediCare Premier',
    policy_type: 'family_floater',
    verification_status: 'verified',
    source_url: 'https://www.tataaig.com/s3/Medi_Care_Premier_48e8569ce1.PDF',
    official_policy_pdf_url: 'https://www.tataaig.com/s3/Medi_Care_Premier_48e8569ce1.PDF',
    description: 'Tata AIG MediCare Premier health insurance policy. UIN: TATHLIP21257V022021.',
    coverage_summary: 'Reimbursement of covered expenses up to specified limit, and payout of lump sum benefit amount or payment of covered expenses up to specified limit.',
    waiting_period: 'Initial waiting period: 30 days for all illnesses (not applicable for accidents or on renewals). Specified diseases/procedures: 24 months. Pre-existing disease: covered after 24 months.',
    eligibility: 'Renewable except on grounds of fraud or misrepresentation by the insured person. Grace period of 30 days for renewal.',
    target_audience: ['individual', 'family'],
    tags: ['UIN:TATHLIP21257V022021']
  },
  {
    companySlug: 'bajaj-allianz',
    policy_name: 'Bajaj Allianz Health Guard',
    policy_type: 'family_floater',
    verification_status: 'verified',
    source_url: 'https://www.bajajallianz.com/download-documents/health-insurance/health-guard/Health-Guard-CIS-print.pdf',
    official_policy_pdf_url: 'https://www.bajajallianz.com/download-documents/health-insurance/health-guard/Health-Guard-Policy-Wordings-print.pdf',
    description: 'Bajaj Allianz Health Guard individual/family health insurance policy. UIN: BAJHLIP26073V082526.',
    waiting_period: 'Initial waiting period: 30 days for all illnesses. Specific waiting period: 24 months for listed procedures including gastrointestinal ulcers, cataracts, fistula, macular degeneration, benign prostatic hypertrophy, hernia of all types, sinuses, fissure in ano, hemorrhoids/piles, hydrocele, dysfunctional uterine bleeding, fibromyoma, endometriosis, hysterectomy, uterine prolapse, stones in the urinary and biliary systems, and surgery on ears/tonsils/adenoids/paranasal sinuses.',
    target_audience: ['individual', 'family'],
    tags: ['UIN:BAJHLIP26073V082526']
  },
  {
    companySlug: 'niva-bupa',
    policy_name: 'ReAssure 2.0',
    policy_type: 'family_floater',
    verification_status: 'verified',
    source_url: 'https://www.nivabupa.com/content/dam/nivabupa/PDF/reassure-2-0/ReAssure%202.0%20-%20SS.pdf',
    official_policy_pdf_url: 'https://www.nivabupa.com/content/dam/nivabupa/PDF/reassure-2-0/ReAssure%202.0%20-%20Policy%20Wording.pdf',
    description: 'Niva Bupa ReAssure 2.0 health insurance plan. UIN: NBHHLIP23169V012223.',
    coverage_summary: 'Plan features as stated in the official sales sheet: ReAssure Forever (activates after first claim, unlimited times), Lock the Clock (premium as per entry age until you claim), Booster+ (carry forward balance sum insured), Safeguard+ (non-payables covered), Live Healthy (up to 30% discount on renewal premium based on step count), and health checkup from day 1. Available in Platinum+ and Titanium+ variants.',
    target_audience: ['individual', 'family'],
    key_benefits: [
      'ReAssure Forever — turns on after 1st claim, unlimited times',
      'Booster+ — carry forward balance sum insured',
      'Lock the Clock — pay as per entry age until you claim',
      'Live Healthy — up to 30% discount on renewal premium basis step count'
    ],
    tags: ['UIN:NBHHLIP23169V012223']
  },

  // ---------- UNVERIFIED: official source not reachable at seed time ----------
  // Identity fields only. Descriptive fields intentionally left blank — do not guess.
  { companySlug: 'star-health', policy_name: 'Star Comprehensive Insurance Policy', policy_type: 'individual', verification_status: 'unverified', official_policy_pdf_url: 'https://web.starhealth.in/sites/default/files/policy-clauses/star-comprehensive-policy-clause-new-1.pdf' },
  { companySlug: 'star-health', policy_name: 'Star Health Senior Citizens Red Carpet Policy', policy_type: 'senior_citizen', verification_status: 'unverified' },
  { companySlug: 'star-health', policy_name: 'Star Critical Illness Insurance Policy', policy_type: 'critical_illness', verification_status: 'unverified' },
  { companySlug: 'niva-bupa', policy_name: 'Health Companion', policy_type: 'individual', verification_status: 'unverified' },
  { companySlug: 'hdfc-ergo', policy_name: 'my:Health Suraksha', policy_type: 'individual', verification_status: 'unverified' },
  { companySlug: 'icici-lombard', policy_name: 'Complete Health Insurance', policy_type: 'family_floater', verification_status: 'unverified' },
  { companySlug: 'icici-lombard', policy_name: 'Health Booster', policy_type: 'top_up', verification_status: 'unverified' },
  { companySlug: 'care-health', policy_name: 'Care Senior', policy_type: 'senior_citizen', verification_status: 'unverified' },
  { companySlug: 'aditya-birla-health', policy_name: 'Activ Health Platinum', policy_type: 'family_floater', verification_status: 'unverified' },
  { companySlug: 'aditya-birla-health', policy_name: 'Activ Assure', policy_type: 'individual', verification_status: 'unverified' },
  { companySlug: 'bajaj-allianz', policy_name: 'Global Health Care', policy_type: 'individual', verification_status: 'unverified' },
  { companySlug: 'sbi-general', policy_name: 'Arogya Premier Policy', policy_type: 'individual', verification_status: 'unverified' },
  { companySlug: 'sbi-general', policy_name: 'Arogya Top Up Policy', policy_type: 'top_up', verification_status: 'unverified' },
  { companySlug: 'reliance-general', policy_name: 'Reliance Health Gain Policy', policy_type: 'family_floater', verification_status: 'unverified' },
  { companySlug: 'reliance-general', policy_name: 'Reliance Health Infinity Policy', policy_type: 'individual', verification_status: 'unverified' }
];

async function seed(): Promise<void> {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(ConfigService.database.mongoUri, { dbName: ConfigService.database.dbName });

  await InsuranceCompany.deleteMany({});
  await InsurancePolicy.deleteMany({});

  const bySlug: Record<string, { id: string; name: string; logo: string; site: string }> = {};

  for (const c of companies) {
    const created = await InsuranceCompany.create({
      name: c.name,
      slug: c.slug,
      logo_url: c.logo_url,
      official_website: c.official_website,
      is_active: true
    });
    bySlug[c.slug] = { id: created._id.toString(), name: c.name, logo: c.logo_url, site: c.official_website };
  }

  const now = new Date();
  let verified = 0;

  for (const p of policies) {
    const company = bySlug[p.companySlug];
    if (!company) {
      console.warn(`  ! Unknown company slug "${p.companySlug}" — skipping ${p.policy_name}`);
      continue;
    }

    await InsurancePolicy.create({
      company_id: company.id,
      company_name: company.name,
      company_logo_url: company.logo,
      policy_name: p.policy_name,
      policy_type: p.policy_type,
      description: p.description,
      coverage_summary: p.coverage_summary,
      waiting_period: p.waiting_period,
      eligibility: p.eligibility,
      sum_insured_range: p.sum_insured_range,
      target_audience: p.target_audience || [],
      key_benefits: p.key_benefits || [],
      key_exclusions: p.key_exclusions || [],
      official_website: company.site,
      official_policy_pdf_url: p.official_policy_pdf_url,
      source_url: p.source_url,
      source_fetched_at: p.verification_status === 'verified' ? now : undefined,
      verification_status: p.verification_status,
      is_active: true,
      tags: p.tags || []
    });

    if (p.verification_status === 'verified') verified++;
    console.log(`  ${p.verification_status === 'verified' ? '[verified]  ' : '[unverified]'} ${company.name} — ${p.policy_name}`);
  }

  console.log(`\n${companies.length} companies, ${policies.length} policies (${verified} verified, ${policies.length - verified} identity-only).`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
