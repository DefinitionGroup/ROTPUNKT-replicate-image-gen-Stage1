import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  {
    // Training data, build output and generated code are not source.
    ignores: ['arc/**', 'Frontfarben/**', 'grifffronten/**', '.next/**', 'public/**', 'sanity/sanity.types.ts', 'next-env.d.ts', 'debug-*.js'],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
]

export default eslintConfig
