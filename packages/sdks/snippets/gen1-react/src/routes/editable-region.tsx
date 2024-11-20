// routes/editable-region.tsx

import { Builder, BuilderComponent, builder } from '@builder.io/react';
import { useEffect, useState } from 'react';
import CustomColumns from '../components/CustomColumns';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(CustomColumns, {
  name: 'MyColumns',
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      broadcast: true,
      hideFromUI: true,
      defaultValue: {
        blocks: [],
      },
    },
  ],
});

export default function EditableRegionRoute() {
  const [content, setContent] = useState<any>(null);

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
