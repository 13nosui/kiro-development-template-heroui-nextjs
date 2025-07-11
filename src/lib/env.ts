/**
 * Type-safe environment variable management using Zod
 * Provides strict validation and type safety for all environment variables
 */

import { z } from 'zod';

/**
 * Firebase configuration schema
 * Validates all required Firebase environment variables
 */
const FirebaseConfigSchema = z.object({
  apiKey: z.string().min(1, 'Firebase API key is required'),
  authDomain: z.string().min(1, 'Firebase auth domain is required'),
  projectId: z.string().min(1, 'Firebase project ID is required'),
  storageBucket: z.string().min(1, 'Firebase storage bucket is required'),
  messagingSenderId: z.string().min(1, 'Firebase messaging sender ID is required'),
  appId: z.string().min(1, 'Firebase app ID is required'),
});

/**
 * Application environment schema
 * Validates all application-level environment variables
 */
const AppConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.string().regex(/^\d+$/, 'Port must be a number').transform(Number).default('3000'),
});

/**
 * Complete environment schema
 * Combines all environment variable schemas
 */
const EnvSchema = z.object({
  firebase: FirebaseConfigSchema,
  app: AppConfigSchema,
});

/**
 * Type definitions derived from schemas
 */
export type FirebaseConfig = z.infer<typeof FirebaseConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Raw environment variable extraction
 */
function extractEnvVars() {
  return {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    app: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
    },
  };
}

/**
 * Validated environment configuration
 */
let envConfig: EnvConfig | null = null;

/**
 * Get validated environment configuration
 * Lazy initialization with caching
 */
export function getEnvConfig(): EnvConfig {
  if (envConfig === null) {
    const rawEnv = extractEnvVars();
    envConfig = EnvSchema.parse(rawEnv);
  }
  return envConfig;
}

/**
 * Get Firebase configuration specifically
 */
export function getFirebaseConfig(): FirebaseConfig {
  return getEnvConfig().firebase;
}

/**
 * Get application configuration specifically
 */
export function getAppConfig(): AppConfig {
  return getEnvConfig().app;
}

/**
 * Environment validation error class
 */
export class EnvValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
    public readonly envVars: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }

  /**
   * Get formatted error message with details
   */
  getDetailedMessage(): string {
    const issueMessages = this.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('\n  ');
    
    return `Environment validation failed:\n  ${issueMessages}`;
  }

  /**
   * Get missing environment variables
   */
  getMissingVars(): string[] {
    return this.issues
      .filter(issue => issue.code === 'invalid_type' && issue.received === 'undefined')
      .map(issue => issue.path.join('.'));
  }
}

/**
 * Safe environment configuration getter
 * Returns null if validation fails instead of throwing
 */
export function safeGetEnvConfig(): { success: true; config: EnvConfig } | { success: false; error: EnvValidationError } {
  try {
    const config = getEnvConfig();
    return { success: true, config };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const rawEnv = extractEnvVars();
      const envError = new EnvValidationError(
        'Environment validation failed',
        error.issues,
        rawEnv
      );
      return { success: false, error: envError };
    }
    throw error; // Re-throw non-validation errors
  }
}

/**
 * Check if environment is properly configured
 */
export function isEnvConfigured(): boolean {
  const result = safeGetEnvConfig();
  return result.success;
}

/**
 * Validate specific environment section
 */
export function validateFirebaseConfig(): { success: true; config: FirebaseConfig } | { success: false; error: string } {
  try {
    const rawFirebase = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const config = FirebaseConfigSchema.parse(rawFirebase);
    return { success: true, config };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      return { success: false, error: `Firebase configuration invalid: ${issues}` };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Safe environment variable getter
 * Returns null if environment variable is not set or is empty
 */
export function getEnvVar(key: string): string | null {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : null;
}

/**
 * Environment variable getter with default value
 */
export function getEnvVarWithDefault(key: string, defaultValue: string): string {
  const value = getEnvVar(key);
  return value !== null ? value : defaultValue;
}

/**
 * Required environment variable getter
 * Throws error if environment variable is not set
 */
export function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (value === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Environment variable getter with validation
 */
export function getValidatedEnvVar(
  key: string,
  validator: (value: string) => boolean,
  errorMessage?: string
): string | null {
  const value = getEnvVar(key);
  if (value === null) {
    return null;
  }
  
  if (!validator(value)) {
    throw new Error(errorMessage || `Environment variable ${key} has invalid value`);
  }
  
  return value;
}

/**
 * Required environment variable getter with validation
 */
export function getRequiredValidatedEnvVar(
  key: string,
  validator: (value: string) => boolean,
  errorMessage?: string
): string {
  const value = getRequiredEnvVar(key);
  
  if (!validator(value)) {
    throw new Error(errorMessage || `Environment variable ${key} has invalid value`);
  }
  
  return value;
}

/**
 * Get numeric environment variable
 */
export function getNumericEnvVar(key: string): number | null {
  const value = getEnvVar(key);
  if (value === null) {
    return null;
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  
  return num;
}

/**
 * Get required numeric environment variable
 */
export function getRequiredNumericEnvVar(key: string): number {
  const value = getNumericEnvVar(key);
  if (value === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnvVar(key: string): boolean | null {
  const value = getEnvVar(key);
  if (value === null) {
    return null;
  }
  
  const lowercaseValue = value.toLowerCase();
  if (lowercaseValue === 'true' || lowercaseValue === '1') {
    return true;
  }
  if (lowercaseValue === 'false' || lowercaseValue === '0') {
    return false;
  }
  
  throw new Error(`Environment variable ${key} is not a valid boolean`);
}

/**
 * Get required boolean environment variable
 */
export function getRequiredBooleanEnvVar(key: string): boolean {
  const value = getBooleanEnvVar(key);
  if (value === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Development utilities
 */
export const envUtils = {
  /**
   * Check if running in development mode
   */
  isDevelopment: (): boolean => {
    try {
      return getAppConfig().nodeEnv === 'development';
    } catch {
      return process.env.NODE_ENV === 'development';
    }
  },

  /**
   * Check if running in production mode
   */
  isProduction: (): boolean => {
    try {
      return getAppConfig().nodeEnv === 'production';
    } catch {
      return process.env.NODE_ENV === 'production';
    }
  },

  /**
   * Check if running in test mode
   */
  isTest: (): boolean => {
    try {
      return getAppConfig().nodeEnv === 'test';
    } catch {
      return process.env.NODE_ENV === 'test';
    }
  },

  /**
   * Get safe environment summary for logging
   */
  getEnvSummary: (): Record<string, boolean | string> => {
    const result = safeGetEnvConfig();
    if (result.success) {
      return {
        configured: true,
        environment: result.config.app.nodeEnv,
        firebaseConfigured: Boolean(result.config.firebase.apiKey),
      };
    } else {
      return {
        configured: false,
        missingVars: result.error.getMissingVars().join(', '),
        environment: process.env.NODE_ENV || 'unknown',
      };
    }
  },
};
