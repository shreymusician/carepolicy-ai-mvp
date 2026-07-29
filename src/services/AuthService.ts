import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt, { SignOptions } from 'jsonwebtoken';
import ConfigService from '../config/service';
import PolicyHolder, { IPolicyHolder } from '../models/PolicyHolder';
import InsuranceCoordinator, { IInsuranceCoordinator } from '../models/InsuranceCoordinator';
import {
  AccountNotFoundError,
  AuthUserResponse,
  CoordinatorSignupRequest,
  ApprovalStatus,
  DuplicateEmailError,
  InvalidCredentialsError,
  JwtPayload,
  LoginRequest,
  PolicyHolderSignupRequest,
  ValidationError
} from '../types/auth';
import {
  validateConfirmPasswordField,
  validateEmailField,
  validateMobileField,
  validatePasswordField,
  validateRequired
} from '../utils/authValidation';

class AuthService {
  private demoCounter = 1;
  private demoPolicyHolders: Map<string, { id: string; name: string; email: string; password_hash: string; mobile: string }> = new Map();
  private demoCoordinators: Map<string, { id: string; name: string; email: string; password_hash: string; mobile: string; hospital_name: string; employee_id: string; approval_status: ApprovalStatus }> = new Map();

  private dbAvailable(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async signupPolicyHolder(payload: PolicyHolderSignupRequest): Promise<{ user: AuthUserResponse; token: string }> {
    if (!this.dbAvailable()) {
      // Demo fallback: create an in-memory policy holder account
      const errors: Record<string, string> = {};
      validateRequired(payload.full_name, 'full_name', errors);
      validateEmailField(payload.email, 'email', errors);
      validateMobileField(payload.mobile, errors);
      validatePasswordField(payload.password, errors);
      validateConfirmPasswordField(payload.password, payload.confirm_password, errors);
      if (Object.keys(errors).length > 0) throw new ValidationError(errors);

      const email = payload.email.trim().toLowerCase();
      if (this.demoPolicyHolders.has(email)) throw new DuplicateEmailError();

      const passwordHash = await bcrypt.hash(payload.password, ConfigService.auth.bcryptSaltRounds);
      const id = `demo-ph-${this.demoCounter++}`;
      const user = { id, name: payload.full_name.trim(), email, password_hash: passwordHash, mobile: payload.mobile.trim() };
      this.demoPolicyHolders.set(email, user);

      const authUser: AuthUserResponse = { id, role: 'policy_holder', name: user.name, email: user.email };
      return { user: authUser, token: this.signToken(id, 'policy_holder', user.email, user.name) };
    }
    const errors: Record<string, string> = {};
    validateRequired(payload.full_name, 'full_name', errors);
    validateEmailField(payload.email, 'email', errors);
    validateMobileField(payload.mobile, errors);
    validatePasswordField(payload.password, errors);
    validateConfirmPasswordField(payload.password, payload.confirm_password, errors);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const email = payload.email.trim().toLowerCase();
    const existing = await PolicyHolder.findOne({ email });
    if (existing) throw new DuplicateEmailError();

    const passwordHash = await bcrypt.hash(payload.password, ConfigService.auth.bcryptSaltRounds);
    const user = await PolicyHolder.create({
      name: payload.full_name.trim(),
      email,
      password_hash: passwordHash,
      mobile: payload.mobile.trim()
    });

    return { user: this.toPolicyHolderResponse(user), token: this.signToken(user._id.toString(), 'policy_holder', user.email, user.name) };
  }

  async loginPolicyHolder(payload: LoginRequest): Promise<{ user: AuthUserResponse; token: string }> {
    if (!this.dbAvailable()) {
      const errors: Record<string, string> = {};
      validateEmailField(payload.email, 'email', errors);
      validateRequired(payload.password, 'password', errors);
      if (Object.keys(errors).length > 0) throw new ValidationError(errors);

      const email = payload.email.trim().toLowerCase();
      const user = this.demoPolicyHolders.get(email as string);
      if (!user) throw new AccountNotFoundError();

      const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);
      if (!passwordMatches) throw new InvalidCredentialsError();

      const authUser: AuthUserResponse = { id: user.id, role: 'policy_holder', name: user.name, email: user.email };
      return { user: authUser, token: this.signToken(user.id, 'policy_holder', user.email, user.name) };
    }
    const errors: Record<string, string> = {};
    validateEmailField(payload.email, 'email', errors);
    validateRequired(payload.password, 'password', errors);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const email = payload.email.trim().toLowerCase();
    const user = await PolicyHolder.findOne({ email }).select('+password_hash');
    if (!user) throw new AccountNotFoundError();

    const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);
    if (!passwordMatches) throw new InvalidCredentialsError();

    return { user: this.toPolicyHolderResponse(user), token: this.signToken(user._id.toString(), 'policy_holder', user.email, user.name) };
  }

  async signupCoordinator(payload: CoordinatorSignupRequest): Promise<{ user: AuthUserResponse; token: string }> {
    if (!this.dbAvailable()) {
      const errors: Record<string, string> = {};
      validateRequired(payload.full_name, 'full_name', errors);
      validateRequired(payload.hospital_name, 'hospital_name', errors);
      validateEmailField(payload.email, 'email', errors);
      validateRequired(payload.employee_id, 'employee_id', errors);
      validateMobileField(payload.mobile, errors);
      validatePasswordField(payload.password, errors);
      validateConfirmPasswordField(payload.password, payload.confirm_password, errors);
      if (Object.keys(errors).length > 0) throw new ValidationError(errors);

      const email = payload.email.trim().toLowerCase();
      if (this.demoCoordinators.has(email)) throw new DuplicateEmailError();

      const passwordHash = await bcrypt.hash(payload.password, ConfigService.auth.bcryptSaltRounds);
      const id = `demo-co-${this.demoCounter++}`;
      const user = { id, name: payload.full_name.trim(), email, password_hash: passwordHash, mobile: payload.mobile.trim(), hospital_name: payload.hospital_name.trim(), employee_id: payload.employee_id.trim(), approval_status: 'pending' as ApprovalStatus };
      this.demoCoordinators.set(email, user);

      const authUser: AuthUserResponse = { id, role: 'insurance_coordinator', name: user.name, email: user.email, hospital_name: user.hospital_name, employee_id: user.employee_id, approval_status: 'pending' };
      return { user: authUser, token: this.signToken(id, 'insurance_coordinator', user.email, user.name) };
    }
    const errors: Record<string, string> = {};
    validateRequired(payload.full_name, 'full_name', errors);
    validateRequired(payload.hospital_name, 'hospital_name', errors);
    validateEmailField(payload.email, 'email', errors);
    validateRequired(payload.employee_id, 'employee_id', errors);
    validateMobileField(payload.mobile, errors);
    validatePasswordField(payload.password, errors);
    validateConfirmPasswordField(payload.password, payload.confirm_password, errors);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const email = payload.email.trim().toLowerCase();
    const existing = await InsuranceCoordinator.findOne({ email });
    if (existing) throw new DuplicateEmailError();

    const passwordHash = await bcrypt.hash(payload.password, ConfigService.auth.bcryptSaltRounds);
    const user = await InsuranceCoordinator.create({
      name: payload.full_name.trim(),
      email,
      password_hash: passwordHash,
      mobile: payload.mobile.trim(),
      hospital_name: payload.hospital_name.trim(),
      employee_id: payload.employee_id.trim()
    });

    return {
      user: this.toCoordinatorResponse(user),
      token: this.signToken(user._id.toString(), 'insurance_coordinator', user.email, user.name)
    };
  }

  async loginCoordinator(payload: LoginRequest): Promise<{ user: AuthUserResponse; token: string }> {
    if (!this.dbAvailable()) {
      const errors: Record<string, string> = {};
      validateEmailField(payload.email, 'email', errors);
      validateRequired(payload.password, 'password', errors);
      if (Object.keys(errors).length > 0) throw new ValidationError(errors);

      const email = payload.email.trim().toLowerCase();
      const user = this.demoCoordinators.get(email as string);
      if (!user) throw new AccountNotFoundError();

      const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);
      if (!passwordMatches) throw new InvalidCredentialsError();

      const authUser: AuthUserResponse = { id: user.id, role: 'insurance_coordinator', name: user.name, email: user.email, hospital_name: user.hospital_name, employee_id: user.employee_id, approval_status: user.approval_status };
      return { user: authUser, token: this.signToken(user.id, 'insurance_coordinator', user.email, user.name) };
    }
    const errors: Record<string, string> = {};
    validateEmailField(payload.email, 'email', errors);
    validateRequired(payload.password, 'password', errors);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    const email = payload.email.trim().toLowerCase();
    const user = await InsuranceCoordinator.findOne({ email }).select('+password_hash');
    if (!user) throw new AccountNotFoundError();

    const passwordMatches = await bcrypt.compare(payload.password, user.password_hash);
    if (!passwordMatches) throw new InvalidCredentialsError();

    return {
      user: this.toCoordinatorResponse(user),
      token: this.signToken(user._id.toString(), 'insurance_coordinator', user.email, user.name)
    };
  }

  async getCurrentUser(userId: string, role: JwtPayload['role']): Promise<AuthUserResponse> {
    if (!this.dbAvailable()) {
      // Try to return from demo stores
      for (const user of this.demoPolicyHolders.values()) {
        if (user.id === userId) return { id: user.id, role: 'policy_holder', name: user.name, email: user.email };
      }
      for (const user of this.demoCoordinators.values()) {
        if (user.id === userId) return { id: user.id, role: 'insurance_coordinator', name: user.name, email: user.email, hospital_name: user.hospital_name, employee_id: user.employee_id, approval_status: user.approval_status };
      }
      throw new AccountNotFoundError();
    }
    if (role === 'policy_holder') {
      const user = await PolicyHolder.findById(userId);
      if (!user) throw new AccountNotFoundError();
      return this.toPolicyHolderResponse(user);
    }

    const user = await InsuranceCoordinator.findById(userId);
    if (!user) throw new AccountNotFoundError();
    return this.toCoordinatorResponse(user);
  }

  async demoLoginPolicyHolder(): Promise<{ user: AuthUserResponse; token: string }> {
    // Create a simple in-memory demo policy holder and return token
    const id = `demo-ph-${this.demoCounter++}`;
    const email = `demo.user+${this.demoCounter}@example.com`;
    const name = 'Demo User';
    const passwordHash = await bcrypt.hash('demopassword', ConfigService.auth.bcryptSaltRounds);
    const mobile = '9000000000';

    const userRec = { id, name, email, password_hash: passwordHash, mobile };
    this.demoPolicyHolders.set(email, userRec);

    const authUser: AuthUserResponse = { id, role: 'policy_holder', name, email };
    return { user: authUser, token: this.signToken(id, 'policy_holder', email, name) };
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, ConfigService.auth.jwtSecret) as JwtPayload;
  }

  private signToken(id: string, role: JwtPayload['role'], email: string, name: string): string {
    const payload: JwtPayload = { sub: id, role, email, name };
    const options: SignOptions = { expiresIn: ConfigService.auth.jwtExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, ConfigService.auth.jwtSecret, options);
  }

  private toPolicyHolderResponse(user: IPolicyHolder): AuthUserResponse {
    return {
      id: user._id.toString(),
      role: 'policy_holder',
      name: user.name,
      email: user.email
    };
  }

  private toCoordinatorResponse(user: IInsuranceCoordinator): AuthUserResponse {
    return {
      id: user._id.toString(),
      role: 'insurance_coordinator',
      name: user.name,
      email: user.email,
      hospital_name: user.hospital_name,
      employee_id: user.employee_id,
      approval_status: user.approval_status
    };
  }
}

export default new AuthService();
