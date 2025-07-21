// Mock setImmediate for tests
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

// Mock SVG components for tests
jest.mock('*.svg', () => ({
  __esModule: true,
  default: 'svg',
  ReactComponent: ({ ...props }) => {
    const React = require('react');
    return React.createElement('svg', { 'data-testid': 'mock-svg', ...props });
  },
}));