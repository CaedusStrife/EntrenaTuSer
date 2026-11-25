import globals from 'globals';
import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'api/**',
      'tests/**',
      '*.min.js',
      'dist/**',
      'build/**',
      '.vscode/**',
      '.idea/**',
      '*.log',
      'coverage/**',
    ],
  },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2023,
        ...globals.node,
        lucide: 'readonly',
        showToast: 'readonly',
        showNotification: 'readonly',
        API_BASE_URL: 'readonly',
        allExercises: 'readonly',
        toggleExerciseSelection: 'readonly',
        routineWizard: 'readonly',
        saveRoutineFromWizard: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
    plugins: {
      import: pluginImport,
      jsdoc: pluginJsdoc,
      prettier: pluginPrettier,
    },
    rules: {
      // Core ESLint recommended
      ...js.configs.recommended.rules,

      // Prettier integration
      'prettier/prettier': 'error',

      // Import/order rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-cycle': 'warn',

      // JSDoc rules - only require for exported/public functions
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: [
            'FunctionDeclaration',
            'MethodDefinition',
            'ClassDeclaration',
            'ArrowFunctionExpression',
            'FunctionExpression',
          ],
          exemptEmptyFunctions: true,
        },
      ],
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-hyphen-before-param-description': 'warn',
      'jsdoc/valid-types': 'warn',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-values': 'warn',

      // Best practices
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error', 'info', 'log'],
        },
      ],
      'no-undef': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'template-curly-spacing': 'error',

      // Accessibility
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
    },
  },
  {
    files: ['*.config.js', '*.config.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
];
