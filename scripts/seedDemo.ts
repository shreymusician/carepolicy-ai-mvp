import '../src/env';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import ConfigService from '../src/config/service';
import PolicyHolder from '../src/models/PolicyHolder';
import InsuranceCoordinator from '../src/models/InsuranceCoordinator';
import InsurancePolicy from '../src/models/InsurancePolicy';
import PriorAuthCase, { CaseStatus, ICaseMedicalDocument } from '../src/models/PriorAuthCase';

/*
 * Demo data for judge/reviewer evaluation.
 *
 * Creates fixed-credential demo accounts and a set of Prior Authorization cases
 * spanning every workflow stage, so the coordinator dashboard is populated on
 * first login instead of being empty. Uploaded-document rows use the same
 * metadata-only shape the real upload endpoint stores (no binary files exist
 * anywhere in this system) - this is demo data, not simulated AI output.
 *
 * Safe to re-run: accounts and cases are upserted by a stable identifier.
 */

const DEMO_COORDINATOR = {
  email: 'demo.coordinator@myinsurance.app',
  password: 'DemoCoord@123',
  full_name: 'Anjali Mehta',
  hospital_name: 'Sunrise Multispeciality Hospital',
  employee_id: 'EMP-DEMO-01',
  mobile: '9800000001'
};

const DEMO_POLICY_HOLDER = {
  email: 'demo.policyholder@myinsurance.app',
  password: 'DemoUser@123',
  full_name: 'Rahul Sharma',
  mobile: '9800000002'
};

function mockDocument(category: ICaseMedicalDocument['category'], filename: string, sizeKb: number): ICaseMedicalDocument {
  return {
    id: new mongoose.Types.ObjectId().toString(),
    category,
    filename,
    size: sizeKb * 1024,
    mimetype: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    uploaded_at: new Date()
  };
}

interface DemoCaseSeed {
  patient_name: string;
  status: CaseStatus;
  policyQuery: { policy_name?: string; hasKnowledge?: boolean };
  documents: ICaseMedicalDocument[];
}

async function run(): Promise<void> {
  await mongoose.connect(ConfigService.database.mongoUri, { dbName: 'carepolicy-ai' });
  console.log('Connected to MongoDB');

  // --- Demo accounts -------------------------------------------------
  const passwordHash = await bcrypt.hash(DEMO_COORDINATOR.password, ConfigService.auth.bcryptSaltRounds);
  const coordinator = await InsuranceCoordinator.findOneAndUpdate(
    { email: DEMO_COORDINATOR.email },
    {
      $setOnInsert: {
        email: DEMO_COORDINATOR.email,
        name: DEMO_COORDINATOR.full_name,
        password_hash: passwordHash,
        mobile: DEMO_COORDINATOR.mobile,
        hospital_name: DEMO_COORDINATOR.hospital_name,
        employee_id: DEMO_COORDINATOR.employee_id,
        approval_status: 'approved'
      }
    },
    { upsert: true, new: true }
  );
  console.log(`Coordinator ready: ${DEMO_COORDINATOR.email} / ${DEMO_COORDINATOR.password}`);

  const policyHolderHash = await bcrypt.hash(DEMO_POLICY_HOLDER.password, ConfigService.auth.bcryptSaltRounds);
  await PolicyHolder.findOneAndUpdate(
    { email: DEMO_POLICY_HOLDER.email },
    {
      $setOnInsert: {
        email: DEMO_POLICY_HOLDER.email,
        name: DEMO_POLICY_HOLDER.full_name,
        password_hash: policyHolderHash,
        mobile: DEMO_POLICY_HOLDER.mobile
      }
    },
    { upsert: true, new: true }
  );
  console.log(`Policy holder ready: ${DEMO_POLICY_HOLDER.email} / ${DEMO_POLICY_HOLDER.password}`);

  // --- Pick real policies to attach to demo cases ---------------------
  const withKnowledge = await InsurancePolicy.find({ policy_name: { $in: ['Care Supreme', 'my:Optima Secure', 'Tata AIG MediCare', 'Star Health Assure Insurance'] } });
  const anyPolicies = await InsurancePolicy.find().limit(10);
  const pick = (name: string) =>
    withKnowledge.find(p => p.policy_name === name) || anyPolicies[Math.floor(Math.random() * anyPolicies.length)];

  const caseSeeds: DemoCaseSeed[] = [
    {
      patient_name: 'Ramesh Kumar',
      status: 'ready_for_review',
      policyQuery: { policy_name: 'Care Supreme' },
      documents: [
        mockDocument('discharge_summary', 'ramesh_discharge_summary.pdf', 420),
        mockDocument('lab_reports', 'ramesh_lab_reports.pdf', 180),
        mockDocument('bills', 'ramesh_hospital_bill.pdf', 95)
      ]
    },
    {
      patient_name: 'Anita Verma',
      status: 'prior_authorization',
      policyQuery: { policy_name: 'my:Optima Secure' },
      documents: [
        mockDocument('discharge_summary', 'anita_discharge_summary.pdf', 310),
        mockDocument('prescriptions', 'anita_prescription.jpg', 60)
      ]
    },
    {
      patient_name: 'Suresh Rao',
      status: 'medical_records',
      policyQuery: { policy_name: 'Tata AIG MediCare' },
      documents: [mockDocument('lab_reports', 'suresh_lab_reports.pdf', 140)]
    },
    {
      patient_name: 'Fatima Sheikh',
      status: 'policy_review',
      policyQuery: { policy_name: 'Star Health Assure Insurance' },
      documents: []
    },
    {
      patient_name: 'Vikram Singh',
      status: 'insurance_selection',
      policyQuery: {},
      documents: []
    }
  ];

  for (const seed of caseSeeds) {
    const existing = await PriorAuthCase.findOne({ coordinator_id: coordinator!._id, patient_name: seed.patient_name });
    if (existing) {
      console.log(`Case already exists, skipping: ${seed.patient_name}`);
      continue;
    }

    const policy = seed.policyQuery.policy_name ? pick(seed.policyQuery.policy_name) : null;
    const now = new Date();

    await PriorAuthCase.create({
      coordinator_id: coordinator!._id,
      patient_name: seed.patient_name,
      status: seed.status,
      insurance_selection: policy
        ? {
            company_id: policy.company_id,
            company_name: policy.company_name,
            policy_id: policy._id,
            policy_name: policy.policy_name,
            policy_type: policy.policy_type,
            confirmed_at: now
          }
        : undefined,
      policy_review_confirmed_at: ['medical_records', 'prior_authorization', 'ready_for_review'].includes(seed.status)
        ? now
        : undefined,
      medical_documents: seed.documents,
      medical_records_confirmed_at: ['prior_authorization', 'ready_for_review'].includes(seed.status) ? now : undefined,
      prior_authorization_generated_at: seed.status === 'ready_for_review' ? now : undefined
    });
    console.log(`Created case: ${seed.patient_name} (${seed.status})`);
  }

  console.log('\nDemo data ready.');
  console.log('Workflow highlights:');
  console.log('  - Coordinator account created for case review and document tracking');
  console.log('  - Policy holder account created for a guided applicant experience');
  console.log('  - Sample cases span intake, medical-records review, prior authorization, and policy review');
  console.log(`Coordinator login -> ${DEMO_COORDINATOR.email} / ${DEMO_COORDINATOR.password}`);
  console.log(`Policy holder login -> ${DEMO_POLICY_HOLDER.email} / ${DEMO_POLICY_HOLDER.password}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
