module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  maxWorkers: 1,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    'shared/(.*)': '<rootDir>/shared/$1',
    'processed-payroll/(.*)': '<rootDir>/processed-payroll/$1',
    'remittances/(.*)': '<rootDir>/remittances/$1',
  },
};
