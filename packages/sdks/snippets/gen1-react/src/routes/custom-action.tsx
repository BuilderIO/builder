import builder, { Builder, BuilderComponent } from '@builder.io/react';
import { type BuilderContent } from '@builder.io/sdk';
import { useEffect, useState } from 'react';

builder.init('ee9f13b4981e489a9a1209887695ef2b');
if (typeof window !== 'undefined') {
  Builder.registerAction({
    name: 'test-action',
    kind: 'function',
    id: 'test-action-id',
    inputs: [
      {
        name: 'actionName',
        type: 'string',
        required: true,
        helperText: 'Action name',
      },
    ],
    action: () => {
      return `console.log("function call") `;
    },
  });
}

function CustomAction() {
  const [content, setContent] = useState<BuilderContent | null>(null);
  useEffect(() => {
    builder
      .get('custom-action', {
        url: window.location.pathname,
      })
      .promise()
      .then(setContent);
  }, []);

  if (!content) {
    return null;
  }

  return <BuilderComponent content={content} model="custom-action" />;
}

export default CustomAction;
