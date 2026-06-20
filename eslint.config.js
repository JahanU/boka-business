import js from '@eslint/js'; // Core ESLint recommended rules
import globals from 'globals'; // Predefined global variables for different environments
import reactHooks from 'eslint-plugin-react-hooks'; // React Hooks specific linting rules
import reactRefresh from 'eslint-plugin-react-refresh'; // React Refresh specific linting rules for Vite
import tsParser from '@typescript-eslint/parser'; // TypeScript parser for ESLint
import tsPlugin from '@typescript-eslint/eslint-plugin'; // TypeScript specific linting rules plugin

export default [
  {
    ignores: [
      '**/dist/**',
      'node_modules',
      'public',
      '.netlify',
      'netlify/.netlify'
    ]
  },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.{js,ts,tsx}', 'netlify/functions/**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
      // Parser options for TypeScript
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Plugins to load
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    // Custom rules overrides
    rules: {
      // React Hooks specific linting rules
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': 'off',
      // TypeScript specific unused variables rule with ignore patterns
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true, // Allow unused variables when destructuring
        },
      ],
      'semi': ['error', 'always'],
    },
  },
];
