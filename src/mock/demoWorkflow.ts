export interface DemoWorkflowStage {
  id: string;
  title: string;
  owner: string;
  description: string;
  status: string;
}

export interface DemoCaseSummary {
  id: string;
  patientName: string;
  status: string;
  summary: string;
  documents: string[];
  highlights: string[];
}

export interface DemoWorkflowPayload {
  projectSummary: string;
  howItWorks: string[];
  workflowStages: DemoWorkflowStage[];
  sampleCase: DemoCaseSummary;
  demoAccounts: Array<{ role: string; email: string; password: string }>;
  apiEndpoints: Array<{ method: string; path: string; purpose: string }>;
}

export function getDemoWorkflowPayload(): DemoWorkflowPayload {
  return {
    projectSummary: 'CarePolicy AI helps hospital coordinators review insurance policies, medical documents, and prior-authorization requirements through a guided workflow.',
    howItWorks: [
      'The coordinator uploads policy documents and medical records through the portal.',
      'The backend extracts text, cleans it, and prepares an AI-assisted analysis.',
      'The system surfaces policy clauses, coverage gaps, and next steps for the case review.',
      'The workflow moves from document intake to policy review and prior-authorization readiness.'
    ],
    workflowStages: [
      {
        id: 'intake',
        title: 'Document Intake',
        owner: 'Coordinator',
        description: 'A case is created and medical documents are attached to the workflow.',
        status: 'Completed'
      },
      {
        id: 'analysis',
        title: 'Policy Analysis',
        owner: 'AI Engine',
        description: 'Insurance policy text is parsed and analyzed against the uploaded documents.',
        status: 'In Progress'
      },
      {
        id: 'review',
        title: 'Coverage Review',
        owner: 'Coordinator',
        description: 'The team validates insurers, exclusions, and approvals before proceeding.',
        status: 'Pending'
      },
      {
        id: 'approval',
        title: 'Prior Authorization',
        owner: 'Hospital Team',
        description: 'The final case is prepared for submission with structured supporting evidence.',
        status: 'Planned'
      }
    ],
    sampleCase: {
      id: 'demo-case-001',
      patientName: 'Ramesh Kumar',
      status: 'ready_for_review',
      summary: 'A knee surgery request that needs review for hospital stay coverage, exclusions, and documentation readiness.',
      documents: ['Discharge summary', 'Lab reports', 'Hospital bills'],
      highlights: ['Coverage check required', 'Pre-authorization likely', 'Missing timeline evidence']
    },
    demoAccounts: [
      { role: 'Coordinator', email: 'demo.coordinator@myinsurance.app', password: 'DemoCoord@123' },
      { role: 'Policy Holder', email: 'demo.policyholder@myinsurance.app', password: 'DemoUser@123' }
    ],
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/analyze', purpose: 'Upload policy and prescription documents for AI-assisted review.' },
      { method: 'POST', path: '/api/v1/chat/:documentId', purpose: 'Ask follow-up questions about an analyzed case.' },
      { method: 'GET', path: '/api/v1/demo/workflow', purpose: 'Return the mock workflow payload for product demos.' }
    ]
  };
}
