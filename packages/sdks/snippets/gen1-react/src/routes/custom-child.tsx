import builder, {
  Builder,
  BuilderComponent,
  withChildren,
} from '@builder.io/react';
import React, { useEffect, useState } from 'react';
import CustomHero from '../components/CustomHero';

builder.init('ee9f13b4981e489a9a1209887695ef2b');

const HeroWithBuilderChildren = withChildren(CustomHero);
Builder.registerComponent(HeroWithBuilderChildren, {
  name: 'CustomHero',
  canHaveChildren: true,
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      component: {
        name: 'Text',
        options: {
          text: 'This is Builder text',
        },
      },
    },
  ],
});

function CustomChild() {
  const [content, setContent] = useState<any>(null);
  useEffect(() => {
    builder
      .get('custom-child', {
        url: window.location.pathname,
      })
      .promise()
      .then(setContent);
  }, []);

  if (!content) {
    return null;
  }

  return <BuilderComponent content={content} model="custom-child" />;
}

export default CustomChild;
