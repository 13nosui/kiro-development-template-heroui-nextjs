// ESLint configuration for AI Development Template
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import next from '@next/eslint-plugin-next';

export default [
  js.configs.recommended,
  
  // TypeScript設定
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        jsx: true,
      },
      globals: {
        // React環境
        React: 'readonly',
        JSX: 'readonly',
        
        // Browser環境
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Audio: 'readonly',
        HTMLAudioElement: 'readonly',
        Buffer: 'readonly',
        Response: 'readonly',
        
        // Node.js環境
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        
        // TypeScript環境
        NodeJS: 'readonly',
        BodyInit: 'readonly',
        ResponseInit: 'readonly',
        SVGSVGElement: 'readonly',
        HTMLButtonElement: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': next,
    },
    rules: {
      // TypeScript推奨ルール
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      
      // React推奨ルール
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // React Hooks推奨ルール
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // 一般的なルール
      'no-unused-vars': 'off', // TypeScriptルールを優先
      'no-undef': 'warn', // TypeScriptで型チェックされるため警告レベル
      'no-useless-escape': 'warn',
      'no-control-regex': 'warn',
      'no-redeclare': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // JavaScript設定
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        jsx: true,
      },
      globals: {
        // React環境
        React: 'readonly',
        JSX: 'readonly',
        
        // Browser環境
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Node.js環境
        process: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': next,
    },
    rules: {
      // React推奨ルール
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // React Hooks推奨ルール
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // 一般的なルール
      'no-useless-escape': 'warn',
      'no-control-regex': 'warn',
      'no-redeclare': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // 設定ファイル用の特別なルール
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
  
  // 無視するファイル・ディレクトリ
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'storybook-static/**',
      '.storybook/**',
      'stories/**',
      '*.d.ts',
    ],
  },
];
