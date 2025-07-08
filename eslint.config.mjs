// ESLint configuration for AI Development Template
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["*.config.{js,ts}", "*.config.*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      // プロジェクト固有のルール設定
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**", 
      "dist/**",
      "build/**",
      "storybook-static/**",
      ".storybook/**",
      "stories/**",
    ],
  }
];

export default eslintConfig;
