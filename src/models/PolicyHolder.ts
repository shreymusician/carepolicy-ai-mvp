import { Schema, model, Document } from 'mongoose';

export interface IPolicyHolder extends Document {
  name: string;
  email: string;
  password_hash: string;
  mobile: string;
  role: 'policy_holder';
  created_at: Date;
  updated_at: Date;
}

const policyHolderSchema = new Schema<IPolicyHolder>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true, select: false },
    mobile: { type: String, required: true, trim: true },
    role: { type: String, required: true, default: 'policy_holder', enum: ['policy_holder'] }
  },
  {
    collection: 'policy_holders',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default model<IPolicyHolder>('PolicyHolder', policyHolderSchema);
