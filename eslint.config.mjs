import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
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
      boundaries,
    },
    processor: angularTemplate.processors['extract-inline-html'],
    settings: {
      // FSD layer boundaries — defines allowed import directions
      'boundaries/elements': [
        { type: 'pages', pattern: 'src/app/pages/*' },
        { type: 'features', pattern: 'src/app/features/*' },
        { type: 'services', pattern: 'src/app/services/*' },
        // entities = domain layer: models, invariants and repository ports.
        // Sits below services so a domain rule can never depend on application wiring.
        { type: 'entities', pattern: 'src/app/entities/*' },
        { type: 'shared', pattern: 'src/app/shared/*' },
        { type: 'core', pattern: 'src/app/core/*' },
        { type: 'app', pattern: 'src/app/*', mode: 'file' },
      ],
    },
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
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // Relax rules that conflict with Angular patterns
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',

      // ─── FSD boundaries ─────────────────────────────────────────────
      // Enforce FSD layer import direction: pages → features → services → shared
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // pages → features, services, entities, shared, core, app root
            {
              from: { type: 'pages' },
              allow: [
                { to: { type: 'features' } },
                { to: { type: 'services' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
                { to: { type: 'core' } },
                { to: { type: 'app' } },
              ],
            },
            // features → services, entities, shared, core, app root (NOT sibling features)
            {
              from: { type: 'features' },
              allow: [
                { to: { type: 'services' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
                { to: { type: 'core' } },
                { to: { type: 'app' } },
              ],
            },
            // services → entities, shared, core, app root
            {
              from: { type: 'services' },
              allow: [
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
                { to: { type: 'core' } },
                { to: { type: 'app' } },
              ],
            },
            // entities → shared, app root only — the domain layer must stay free of
            // application services, so its invariants remain independently testable
            {
              from: { type: 'entities' },
              allow: [{ to: { type: 'shared' } }, { to: { type: 'app' } }],
            },
            // shared → app root only (constants, etc.)
            {
              from: { type: 'shared' },
              allow: [{ to: { type: 'app' } }],
            },
            // core → services, shared, app root
            {
              from: { type: 'core' },
              allow: [
                { to: { type: 'services' } },
                { to: { type: 'shared' } },
                { to: { type: 'app' } },
              ],
            },
            // app root files → any layer
            {
              from: { type: 'app' },
              allow: [
                { to: { type: 'pages' } },
                { to: { type: 'features' } },
                { to: { type: 'services' } },
                { to: { type: 'entities' } },
                { to: { type: 'shared' } },
                { to: { type: 'core' } },
              ],
            },
          ],
        },
      ],
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
