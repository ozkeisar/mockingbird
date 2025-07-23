const React = require('react');

const MockMonacoEditor = React.forwardRef(() => {
  return React.createElement(
    'div',
    { 'data-testid': 'monaco-editor' },
    'Mock Monaco Editor',
  );
});

module.exports = MockMonacoEditor;
module.exports.default = MockMonacoEditor;
