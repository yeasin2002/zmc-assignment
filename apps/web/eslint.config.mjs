import { plugin as shadcn } from '@shadcn/lint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      shadcn,
    },
    rules: {
      'shadcn/no-restyle': 'off',
      'shadcn/no-arbitrary-values': 'error',
    },
  },
  {
    files: ['components/ui/**/*.{js,jsx,ts,tsx}'],
    rules: { 'shadcn/no-restyle': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
