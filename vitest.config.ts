import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text','html'],
      lines: 0,
      statements: 0,
      functions: 0,
      branches: 0
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
