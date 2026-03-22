// @ts-check
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/',
      '.angular/',
      'node_modules/',
      'coverage/',
      '*.js',
      '*.mjs',
    ],
  },

  // ─── TypeScript files ───────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@angular-eslint': angular,
    },
    processor: angularTemplate.processors['extract-inline-html'],
    rules: {
      // Angular recommended rules
      ...angular.configs.recommended.rules,

      // Angular strict rules (from CLAUDE.md requirements)
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-input-rename': 'error',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Relax rules that conflict with Angular patterns
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },

  // ─── Angular HTML templates ─────────────────────────────────────────
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    languageOptions: {
      parser: templateParser,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  },

  // ─── Prettier (must be last — disables formatting rules) ────────────
  eslintConfigPrettier,
);
