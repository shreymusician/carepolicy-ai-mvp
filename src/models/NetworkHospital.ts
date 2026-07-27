import { Schema, model, Document, Types } from 'mongoose';

/**
 * Reserved for the Network Hospitals module. The collection is defined now so that
 * policy documents can reference it later without a migration. Nothing populates
 * this yet — do not surface it in the UI until a verified official source exists.
 */
export interface INetworkHospital extends Document {
  name: string;
  insurer_name?: string;
  company_id?: Types.ObjectId;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  cashless_available?: boolean | null;
  supported_uins: string[];
  source_url?: string;
  source_type?: 'IRDAI' | 'INSURER';
  last_verified_at?: Date;
  is_active: boolean;
  created_at: Date;
}

const networkHospitalSchema = new Schema<INetworkHospital>(
  {
    name: { type: String, required: true, index: true },
    insurer_name: { type: String, index: true },
    company_id: { type: Schema.Types.ObjectId, ref: 'InsuranceCompany', index: true },
    city: { type: String, index: true },
    state: { type: String, index: true },
    pincode: { type: String, index: true },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    cashless_available: { type: Boolean, default: null },
    supported_uins: { type: [String], default: [], index: true },
    source_url: { type: String },
    source_type: { type: String, enum: ['IRDAI', 'INSURER'] },
    last_verified_at: { type: Date },
    is_active: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now, required: true }
  },
  { collection: 'network_hospitals', timestamps: false }
);

networkHospitalSchema.index({ city: 1, supported_uins: 1 });

export default model<INetworkHospital>('NetworkHospital', networkHospitalSchema);
