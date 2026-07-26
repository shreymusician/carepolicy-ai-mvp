export class ConfigService {
  private env = process.env.NODE_ENV || 'development';

  // API Configuration
  api = {
    version: 'v1',
    port: parseInt(process.env.PORT || '5000', 10),
    corsOrigins: this.env === 'production'
      ? ['https://carepolicy.ai']
      : ['*'],
    requestSizeLimitMb: 10,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 100
  };

  // LLM Configuration
  llm = {
    provider: process.env.AI_PROVIDER || 'gemini',
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    maxTokens: 4096,
    timeoutMs: 60000,
    retries: 3,
    backoffMultiplier: 2,
    apiKey: process.env.GEMINI_API_KEY || ''
  };

  // OCR Configuration
  ocr = {
    maxFileSizeMb: 10,
    supportedFormats: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    tesseractLanguage: 'eng',
    tesseractTimeout: 120000
  };

  // Database Configuration
  database = {
    mongoUri: process.env.MONGODB_URI || '',
    dbName: 'carepolicy-ai',
    connectionTimeoutMs: 5000
  };

  // Logging Configuration
  logging = {
    level: this.env === 'production' ? 'info' : 'debug',
    format: 'json'
  };

  // Security Configuration
  security = {
    enableRateLimit: this.env === 'production',
    enableCors: true,
    enableSanitization: true,
    hashFilesForDedup: true,
    enablePromptSanitization: true
  };

  // Feature Flags
  features = {
    asyncProcessing: false,  // Enable in Phase 2
    multiTenancy: false,     // Enable in Phase 3
    caching: false           // Enable in Phase 2
  };

  constructor() {
    this.validate();
  }

  private validate(): void {
    const errors: string[] = [];

    if (!this.llm.apiKey) {
      errors.push('GEMINI_API_KEY environment variable is not set');
    }
    if (!this.database.mongoUri) {
      errors.push('MONGODB_URI environment variable is not set');
    }
    if (!this.api.port || Number.isNaN(this.api.port)) {
      errors.push('PORT environment variable is invalid');
    }
    if (!this.env) {
      errors.push('NODE_ENV environment variable is not set');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join('; ')}`);
    }
  }

  isProduction(): boolean {
    return this.env === 'production';
  }

  isDevelopment(): boolean {
    return this.env === 'development';
  }
}

export default new ConfigService();
