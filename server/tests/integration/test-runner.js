const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout for each test suite
  verbose: true,
  coverage: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/integration/**/*.integration.test.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html']
};

// Test suites to run
const TEST_SUITES = [
  'auth.integration.test.js',
  'farm.integration.test.js',
  'task.integration.test.js',
  'equipment.integration.test.js',
  'notification.integration.test.js',
  'user.integration.test.js'
];

class IntegrationTestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting Integration Test Suite...\n');
    
    // Check if all test files exist
    this.validateTestFiles();
    
    // Run each test suite
    for (const testFile of TEST_SUITES) {
      await this.runTestSuite(testFile);
    }
    
    // Generate summary report
    this.generateSummaryReport();
  }

  validateTestFiles() {
    const missingFiles = [];
    
    for (const testFile of TEST_SUITES) {
      const filePath = path.join(__dirname, 'routes', testFile);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(testFile);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error('❌ Missing test files:', missingFiles.join(', '));
      process.exit(1);
    }
  }

  async runTestSuite(testFile) {
    const testPath = path.join(__dirname, 'routes', testFile);
    const suiteName = testFile.replace('.integration.test.js', '');
    
    console.log(`📋 Running ${suiteName} integration tests...`);
    
    try {
      const startTime = Date.now();
      
      // Run the test using Jest
      const command = `npx jest "${testPath}" --config="${this.getJestConfig()}" --verbose --timeout=${TEST_CONFIG.timeout}`;
      
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.results.push({
        suite: suiteName,
        status: 'PASSED',
        duration,
        output: result
      });
      
      console.log(`✅ ${suiteName} tests passed (${duration}ms)\n`);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.results.push({
        suite: suiteName,
        status: 'FAILED',
        duration,
        output: error.stdout || error.message
      });
      
      console.log(`❌ ${suiteName} tests failed (${duration}ms)\n`);
    }
  }

  getJestConfig() {
    const configPath = path.join(__dirname, '..', 'jest.config.js');
    
    // Create Jest config if it doesn't exist
    if (!fs.existsSync(configPath)) {
      const jestConfig = {
        testEnvironment: TEST_CONFIG.testEnvironment,
        setupFilesAfterEnv: TEST_CONFIG.setupFilesAfterEnv,
        testMatch: TEST_CONFIG.testMatch,
        collectCoverageFrom: TEST_CONFIG.collectCoverageFrom,
        coverageDirectory: TEST_CONFIG.coverageDirectory,
        coverageReporters: TEST_CONFIG.coverageReporters,
        verbose: TEST_CONFIG.verbose,
        testTimeout: TEST_CONFIG.timeout,
        forceExit: true,
        clearMocks: true,
        resetMocks: true,
        restoreMocks: true
      };
      
      fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(jestConfig, null, 2)};`);
    }
    
    return configPath;
  }

  generateSummaryReport() {
    const totalTime = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.status === 'PASSED').length;
    const failedTests = this.results.filter(r => r.status === 'FAILED').length;
    const totalTests = this.results.length;
    
    console.log('📊 Integration Test Summary');
    console.log('==========================');
    console.log(`Total Test Suites: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
    
    // Detailed results
    console.log('Detailed Results:');
    console.log('=================');
    
    this.results.forEach(result => {
      const statusIcon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.suite}: ${result.status} (${result.duration}ms)`);
    });
    
    // Failed test details
    const failedResults = this.results.filter(r => r.status === 'FAILED');
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Test Details:');
      console.log('======================');
      
      failedResults.forEach(result => {
        console.log(`\n${result.suite}:`);
        console.log(result.output);
      });
    }
    
    // Exit with appropriate code
    if (failedTests > 0) {
      console.log('\n❌ Some integration tests failed!');
      process.exit(1);
    } else {
      console.log('\n🎉 All integration tests passed!');
      process.exit(0);
    }
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTestRunner;
