import { Schema, model, Document } from 'mongoose';
import { ApprovalStatus } from '../types/auth';

export interface IInsuranceCoordinator extends Document {
  name: string;
  email: string;
  password_hash: string;
  mobile: string;
  role: 'insurance_coordinator';
  hospital_name: string;
  employee_id: string;
  approval_status: ApprovalStatus;
  created_at: Date;
  updated_at: Date;
}

const insuranceCoordinatorSchema = new Schema<IInsuranceCoordinator>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true, select: false },
    mobile: { type: String, required: true, trim: true },
    role: { type: String, required: true, default: 'insurance_coordinator', enum: ['insurance_coordinator'] },
    hospital_name: { type: String, required: true, trim: true },
    employee_id: { type: String, required: true, trim: true },
    approval_status: { type: String, required: true, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
  },
  {
    collection: 'insurance_coordinators',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default model<IInsuranceCoordinator>('InsuranceCoordinator', insuranceCoordinatorSchema);
