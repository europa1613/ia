You can get Jest test coverage programmatically in several ways:

## 1. Using Jest's Programmatic API

```javascript
const jest = require('jest');

async function runTestsWithCoverage() {
  const options = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'text', 'html'],
    // Add other Jest config options as needed
  };

  const results = await jest.runCLI(options, [process.cwd()]);
  
  // Access coverage data
  const coverageMap = results.results.coverageMap;
  const summary = results.results.coverageMap.getCoverageSummary();
  
  console.log('Coverage Summary:', {
    lines: summary.lines.pct,
    functions: summary.functions.pct,
    branches: summary.branches.pct,
    statements: summary.statements.pct
  });
  
  return results;
}

runTestsWithCoverage();
```

## 2. Reading Coverage Reports After Test Run

```javascript
const fs = require('fs');
const path = require('path');

function getCoverageFromReport() {
  try {
    // Read the JSON coverage report
    const coverageFile = path.join(process.cwd(), 'coverage/coverage-summary.json');
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    
    return {
      total: coverage.total,
      lines: coverage.total.lines.pct,
      functions: coverage.total.functions.pct,
      branches: coverage.total.branches.pct,
      statements: coverage.total.statements.pct
    };
  } catch (error) {
    console.error('Error reading coverage report:', error);
    return null;
  }
}

// Use after running: jest --coverage --coverageReporters=json-summary
const coverage = getCoverageFromReport();
console.log(coverage);
```

## 3. Using a Custom Jest Reporter

Create a custom reporter to capture coverage data:

```javascript
// custom-coverage-reporter.js
class CoverageReporter {
  onRunComplete(contexts, results) {
    if (results.coverageMap) {
      const summary = results.coverageMap.getCoverageSummary();
      
      const coverageData = {
        lines: summary.lines.pct,
        functions: summary.functions.pct,
        branches: summary.branches.pct,
        statements: summary.statements.pct,
        timestamp: new Date().toISOString()
      };
      
      // Save to file or send to API
      require('fs').writeFileSync(
        'coverage-results.json',
        JSON.stringify(coverageData, null, 2)
      );
      
      console.log('Coverage saved:', coverageData);
    }
  }
}

module.exports = CoverageReporter;
```

Then use it in your Jest config:

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  reporters: [
    'default',
    '<rootDir>/custom-coverage-reporter.js'
  ]
};
```

## 4. Using Child Process to Run Jest

```javascript
const { spawn } = require('child_process');
const fs = require('fs');

function runJestWithCoverage() {
  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest', '--coverage', '--coverageReporters=json-summary'], {
      stdio: 'inherit'
    });

    jest.on('close', (code) => {
      if (code === 0) {
        // Read coverage results
        try {
          const coverage = JSON.parse(
            fs.readFileSync('coverage/coverage-summary.json', 'utf8')
          );
          resolve(coverage);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Jest exited with code ${code}`));
      }
    });
  });
}

// Usage
runJestWithCoverage()
  .then(coverage => {
    console.log('Total coverage:', coverage.total);
  })
  .catch(console.error);
```

## 5. Integration with Build Scripts

For use in build pipelines or CI/CD:

```javascript
// coverage-check.js
const { execSync } = require('child_process');
const fs = require('fs');

function checkCoverage(threshold = 80) {
  try {
    // Run Jest with coverage
    execSync('npx jest --coverage --coverageReporters=json-summary', {
      stdio: 'inherit'
    });
    
    // Read results
    const coverage = JSON.parse(
      fs.readFileSync('coverage/coverage-summary.json', 'utf8')
    );
    
    const totalCoverage = coverage.total.lines.pct;
    
    if (totalCoverage < threshold) {
      console.error(`Coverage ${totalCoverage}% is below threshold ${threshold}%`);
      process.exit(1);
    }
    
    console.log(`Coverage ${totalCoverage}% meets threshold ${threshold}%`);
    return coverage;
    
  } catch (error) {
    console.error('Coverage check failed:', error.message);
    process.exit(1);
  }
}

checkCoverage(80);
```

The programmatic API approach (#1) gives you the most control and real-time access to coverage data, while the file-based approaches (#2, #4, #5) are simpler but require Jest to complete its run first.
