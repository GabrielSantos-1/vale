module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-unresolved': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/components/layout/admin/*', 'components/layout/admin/*'],
            message:
              'Use os componentes canônicos em "@/components/ui/layout/admin/*".',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
