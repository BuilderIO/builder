// routes/editable-region.tsx
import builder, {
  Builder,
  BuilderComponent,
  type BuilderContent,
} from '@builder.io/react';
import { useEffect, useState } from 'react';
import CustomColumns from '../components/CustomColumns';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

Builder.registerComponent(CustomColumns, {
  name: 'MyColumns',
  inputs: [
    {
      name: 'column1',
      type: 'uiBlocks',
      defaultValue: [],
    },
    {
      name: 'column2',
      type: 'uiBlocks',
      defaultValue: [],
    },
  ],
});

export default function EditableRegion() {
  const [content, setContent] = useState<BuilderContent | null>(null);

  useEffect(() => {
    builder
      .get('editable-regions', {
        url: window.location.pathname,
      })
      .promise()
      .then(setContent);
  }, []);

  if (!content) {
    return null;
  }

  return <BuilderComponent content={content} model="editable-regions" />;
}
