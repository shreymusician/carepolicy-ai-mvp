import { randomUUID } from 'crypto';
import PriorAuthCase, {
  CASE_STATUS_ORDER,
  CaseStatus,
  DocumentCategory,
  IPriorAuthCase
} from '../models/PriorAuthCase';
import InsurancePolicy from '../models/InsurancePolicy';
import { CaseDetail, CaseNotFoundError, CaseStepOrderError, CaseSummary, CaseValidationError } from '../types/coordinator';

function statusIndex(status: CaseStatus): number {
  return CASE_STATUS_ORDER.indexOf(status);
}

interface UploadedFile {
  originalname: string;
  size: number;
  mimetype: string;
}

class PriorAuthCaseService {
  async createCase(coordinatorId: string, patientName: string): Promise<CaseDetail> {
    if (!patientName || !patientName.trim()) {
      throw new CaseValidationError('Patient name is required.');
    }

    const doc = await PriorAuthCase.create({
      coordinator_id: coordinatorId,
      patient_name: patientName.trim(),
      status: 'insurance_selection',
      medical_documents: []
    });

    return this.toDetail(doc);
  }

  async listCases(coordinatorId: string): Promise<CaseSummary[]> {
    const docs = await PriorAuthCase.find({ coordinator_id: coordinatorId }).sort({ created_at: -1 });
    return docs.map(doc => this.toSummary(doc));
  }

  async getCase(coordinatorId: string, caseId: string): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    return this.toDetail(doc);
  }

  async selectInsurance(coordinatorId: string, caseId: string, policyId: string): Promise<CaseDetail> {
    if (!policyId || !policyId.trim()) {
      throw new CaseValidationError('Please choose a policy before continuing.');
    }

    const doc = await this.findOwnedCase(coordinatorId, caseId);
    const policy = await InsurancePolicy.findById(policyId);
    if (!policy) {
      throw new CaseValidationError('The selected policy could not be found.');
    }

    doc.insurance_selection = {
      company_id: policy.company_id,
      company_name: policy.company_name,
      policy_id: policy._id,
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      confirmed_at: new Date()
    };
    this.advance(doc, 'insurance_selection', 'policy_review');

    await doc.save();
    return this.toDetail(doc);
  }

  async confirmPolicyReview(coordinatorId: string, caseId: string): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    this.requireReached(doc, 'policy_review');
    if (!doc.insurance_selection) {
      throw new CaseValidationError('Select an insurance policy before reviewing its conditions.');
    }

    doc.policy_review_confirmed_at = new Date();
    this.advance(doc, 'policy_review', 'medical_records');

    await doc.save();
    return this.toDetail(doc);
  }

  async addDocument(
    coordinatorId: string,
    caseId: string,
    category: DocumentCategory,
    file: UploadedFile
  ): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    this.requireReached(doc, 'medical_records');

    doc.medical_documents.push({
      id: randomUUID(),
      category,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploaded_at: new Date()
    });

    await doc.save();
    return this.toDetail(doc);
  }

  async removeDocument(coordinatorId: string, caseId: string, documentId: string): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    this.requireReached(doc, 'medical_records');

    doc.medical_documents = doc.medical_documents.filter(d => d.id !== documentId);

    await doc.save();
    return this.toDetail(doc);
  }

  async confirmMedicalRecords(coordinatorId: string, caseId: string): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    this.requireReached(doc, 'medical_records');

    if (doc.medical_documents.length === 0) {
      throw new CaseValidationError('Upload at least one medical document to continue.');
    }

    doc.medical_records_confirmed_at = new Date();
    this.advance(doc, 'medical_records', 'prior_authorization');

    await doc.save();
    return this.toDetail(doc);
  }

  async generatePriorAuthorization(coordinatorId: string, caseId: string): Promise<CaseDetail> {
    const doc = await this.findOwnedCase(coordinatorId, caseId);
    this.requireReached(doc, 'prior_authorization');

    if (doc.status === 'prior_authorization') {
      doc.prior_authorization_generated_at = new Date();
      doc.status = 'ready_for_review';
      await doc.save();
    }

    return this.toDetail(doc);
  }

  private async findOwnedCase(coordinatorId: string, caseId: string): Promise<IPriorAuthCase> {
    const doc = await PriorAuthCase.findById(caseId).catch(() => null);
    if (!doc || doc.coordinator_id.toString() !== coordinatorId) {
      throw new CaseNotFoundError();
    }
    return doc;
  }

  /** A case's status is its furthest completed step, so re-visiting an earlier step never regresses it. */
  private advance(doc: IPriorAuthCase, from: CaseStatus, to: CaseStatus): void {
    if (doc.status === from) {
      doc.status = to;
    }
  }

  private requireReached(doc: IPriorAuthCase, step: CaseStatus): void {
    if (statusIndex(doc.status) < statusIndex(step)) {
      throw new CaseStepOrderError();
    }
  }

  private toSummary(doc: IPriorAuthCase): CaseSummary {
    return {
      id: doc._id.toString(),
      patient_name: doc.patient_name,
      status: doc.status,
      insurance_selection: doc.insurance_selection
        ? {
            policy_id: doc.insurance_selection.policy_id.toString(),
            company_name: doc.insurance_selection.company_name,
            policy_name: doc.insurance_selection.policy_name,
            policy_type: doc.insurance_selection.policy_type
          }
        : undefined,
      document_count: doc.medical_documents.length,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString()
    };
  }

  private toDetail(doc: IPriorAuthCase): CaseDetail {
    return {
      ...this.toSummary(doc),
      medical_documents: doc.medical_documents.map(d => ({
        id: d.id,
        category: d.category,
        filename: d.filename,
        size: d.size,
        mimetype: d.mimetype,
        uploaded_at: d.uploaded_at.toISOString()
      })),
      policy_review_confirmed_at: doc.policy_review_confirmed_at?.toISOString(),
      medical_records_confirmed_at: doc.medical_records_confirmed_at?.toISOString(),
      prior_authorization_generated_at: doc.prior_authorization_generated_at?.toISOString()
    };
  }
}

export default new PriorAuthCaseService();
