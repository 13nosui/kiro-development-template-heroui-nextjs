import { z } from 'zod';
import validator from 'validator';

// 共通バリデーションスキーマ
export const commonSchemas = {
  // 基本的なフィールド
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください')
    .max(254, 'メールアドレスが長すぎます')
    .refine(email => validator.isEmail(email), 'メールアドレスの形式が無効です'),

  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードが長すぎます')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'パスワードは大文字、小文字、数字を含む必要があります'),

  // ID系のバリデーション
  figmaFileId: z.string()
    .min(1, 'ファイルIDは必須です')
    .regex(/^[A-Za-z0-9_-]+$/, 'ファイルIDの形式が無効です')
    .max(100, 'ファイルIDが長すぎます'),

  figmaNodeId: z.string()
    .min(1, 'ノードIDは必須です')
    .regex(/^[A-Za-z0-9:_-]+$/, 'ノードIDの形式が無効です')
    .max(100, 'ノードIDが長すぎます'),

  // URL系のバリデーション
  url: z.string()
    .url('有効なURLを入力してください')
    .refine(url => validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true
    }), 'URLの形式が無効です'),

  // テキスト系のバリデーション
  safeText: z.string()
    .max(1000, 'テキストが長すぎます')
    .refine(text => !validator.contains(text, '<script'), 'スクリプトタグは使用できません')
    .refine(text => !validator.contains(text, 'javascript:'), 'JavaScriptプロトコルは使用できません'),

  // 数値系のバリデーション
  positiveInteger: z.number()
    .int('整数を入力してください')
    .positive('正の数を入力してください')
    .max(Number.MAX_SAFE_INTEGER, '数値が大きすぎます'),

  // 日付系のバリデーション
  dateString: z.string()
    .refine(date => validator.isISO8601(date), '有効な日付形式を入力してください'),
};

// APIリクエストバリデーション
export const apiSchemas = {
  // Figma API関連
  figmaFileRequest: z.object({
    fileId: commonSchemas.figmaFileId,
  }),

  figmaMcpRequest: z.object({
    fileId: commonSchemas.figmaFileId,
    nodeId: commonSchemas.figmaNodeId,
  }),

  // 認証関連
  authRequest: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
  }),

  // 一般的なクエリパラメータ
  paginationQuery: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(20),
  }),
};

// フォームバリデーション
export const formSchemas = {
  // 認証フォーム
  loginForm: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'パスワードは必須です'),
  }),

  registerForm: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  }),

  // プロフィール更新フォーム
  profileUpdateForm: z.object({
    displayName: z.string()
      .min(1, '表示名は必須です')
      .max(50, '表示名が長すぎます')
      .regex(/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s_-]+$/, '表示名に使用できない文字が含まれています'),
    bio: z.string()
      .max(500, '自己紹介が長すぎます')
      .optional(),
  }),
};

// バリデーションエラーのフォーマット
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// バリデーション結果の型
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// バリデーションユーティリティ関数
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      const errors: ValidationError[] = result.error.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message,
        code: error.code,
      }));
      
      return {
        success: false,
        errors,
      };
    }
  } catch {
    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'バリデーションエラーが発生しました',
          code: 'VALIDATION_ERROR',
        },
      ],
    };
  }
};

// API用のバリデーション結果レスポンス
export const createValidationErrorResponse = (errors: ValidationError[]) => {
  return {
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  };
};

// 型安全なバリデーター
export const createValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): ValidationResult<T> => {
    return validateData(schema, data);
  };
};

// 共通バリデーター
export const validators = {
  email: createValidator(commonSchemas.email),
  password: createValidator(commonSchemas.password),
  figmaFileId: createValidator(commonSchemas.figmaFileId),
  figmaNodeId: createValidator(commonSchemas.figmaNodeId),
  url: createValidator(commonSchemas.url),
  safeText: createValidator(commonSchemas.safeText),
  
  // フォームバリデーター
  loginForm: createValidator(formSchemas.loginForm),
  registerForm: createValidator(formSchemas.registerForm),
  profileUpdateForm: createValidator(formSchemas.profileUpdateForm),
  
  // APIバリデーター
  figmaFileRequest: createValidator(apiSchemas.figmaFileRequest),
  figmaMcpRequest: createValidator(apiSchemas.figmaMcpRequest),
  authRequest: createValidator(apiSchemas.authRequest),
  paginationQuery: createValidator(apiSchemas.paginationQuery),
};

// バリデーションミドルウェア用の型
export type ValidatorFunction<T> = (data: unknown) => ValidationResult<T>;
export type SchemaType<T extends ValidatorFunction<unknown>> = 
  T extends ValidatorFunction<infer U> ? U : never;
