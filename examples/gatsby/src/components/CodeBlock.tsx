import React from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import githubGist from 'react-syntax-highlighter/dist/cjs/styles/hljs/github-gist';
import { Builder } from '@builder.io/react';

SyntaxHighlighter.registerLanguage('javascript', javascript);

// Example of a custom component you can use in the Builder visual editor
// See here https://github.com/BuilderIO/builder/tree/master/examples/react-design-system
// for many more custom component examples
function CodeBlockComponent({ language, code }: any /* TODO: types */) {
  return (
    <SyntaxHighlighter
      customStyle={{
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        lineHeight: '1.3em',
        fontSize: '0.9em',
        padding: '20px 0'
      }}
      style={githubGist}
      language={language}
    >
      {code}
    </SyntaxHighlighter>
  );
}

export const CodeBlock = Builder.registerComponent(CodeBlockComponent, {
  name: 'Code Block',
  inputs: [
    {
      name: 'code',
      type: 'string',
      defaultValue: 'const incr = num => num + 1'
    },
    {
      name: 'language',
      type: 'string',
      defaultValue: 'javascript'
    }
  ]
});
