module.exports = {
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './jest.global.setup.ts',
  globalTeardown: './jest.global.teardown.ts'
}