This is a common issue with Jest and ES6 modules. The problem is that Jest runs in a Node.js environment and by default doesn't transform ES6 module syntax (like `export * from`) in `node_modules` packages, expecting them to use CommonJS syntax instead.

Here are several solutions to fix this:

## 1. Configure Jest to transform the problematic package

Add the package to Jest's `transformIgnorePatterns` configuration. In your `jest.config.js` or `package.json`:

```javascript
// jest.config.js
module.exports = {
  transformIgnorePatterns: [
    "node_modules/(?!(your-problematic-package-name)/)"
  ]
};
```

Or in `package.json`:
```json
{
  "jest": {
    "transformIgnorePatterns": [
      "node_modules/(?!(your-problematic-package-name)/)"
    ]
  }
}
```

Replace `your-problematic-package-name` with the actual package name causing issues.

## 2. If you have multiple packages with ES6 modules

```javascript
transformIgnorePatterns: [
  "node_modules/(?!(package1|package2|package3)/)"
]
```

## 3. Configure Jest to use ES modules

If you're using a recent version of Jest, you can configure it to handle ES modules natively:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default-esm', // if using TypeScript
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
```

## 4. Check your Babel configuration

Make sure your `.babelrc` or `babel.config.js` includes the necessary presets:

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react'
  ]
};
```

## 5. Alternative: Mock the problematic module

If the above doesn't work, you can mock the module in your test setup:

```javascript
// In your test file or setupTests.js
jest.mock('problematic-package-name', () => ({
  // Mock the exports you need
  someExport: jest.fn(),
  default: jest.fn()
}));
```

The most common solution is #1 - adding the package to `transformIgnorePatterns`. This tells Jest to apply Babel transformations to that specific package, converting the ES6 module syntax to CommonJS that Jest can understand.
