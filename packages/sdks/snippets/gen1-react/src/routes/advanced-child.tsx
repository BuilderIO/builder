import builder, { Builder, BuilderComponent } from '@builder.io/react';
import { type BuilderContent } from '@builder.io/sdk';
import { useEffect, useState } from 'react';
import CustomTabs from '../components/CustomTabs';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(CustomTabs, {
  name: 'TabFields',
  inputs: [
    {
      name: 'tabList',
      type: 'array',
      subFields: [
        {
          name: 'tabName',
          type: 'string',
        },
        {
          name: 'blocks',
          type: 'uiBlocks',
          defaultValue: [],
        },
      ],
    },
  ],
});

export default function AdvancedChild() {
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    builder
      .get('advanced-child', {
        url: window.location.pathname,
      })
      .promise()
      .then(setContent);
  }, []);

  if (!content) {
    return null;
  }

  return <BuilderComponent content={content} model="advanced-child" />;
}
