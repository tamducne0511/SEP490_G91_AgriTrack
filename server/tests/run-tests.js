#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Test configuration
const testConfig = {
  // Run unit tests
  unit: {
    pattern: 'tests/unit/**/*.test.js',
    description: 'Unit Tests'
  },
  
  // Run integration tests
  integration: {
    pattern: 'tests/integration/**/*.test.js',
    description: 'Integration Tests'
  },
  
  // Run all tests
  all: {
    pattern: 'tests/**/*.test.js',
    description: 'All Tests'
  }
};

// Get test type from command line arguments
const testType = process.argv[2] || 'all';

if (!testConfig[testType]) {
  console.error(`Invalid test type: ${testType}`);
  console.error('Available options: unit, integration, all');
  process.exit(1);
}

const config = testConfig[testType];

console.log(`\n🧪 Running ${config.description}...\n`);

// Run Jest with the specified pattern
const jestProcess = spawn('npx', ['jest', config.pattern, '--verbose'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

jestProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ ${config.description} completed successfully!`);
  } else {
    console.log(`\n❌ ${config.description} failed with exit code ${code}`);
    process.exit(code);
  }
});

jestProcess.on('error', (error) => {
  console.error(`\n❌ Error running ${config.description}:`, error.message);
  process.exit(1);
});
