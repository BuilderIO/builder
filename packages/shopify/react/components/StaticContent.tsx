import React, { useEffect, useRef } from 'react';
import { BuilderElement, Builder } from '@builder.io/sdk';
import { BuilderBlockComponent, withBuilder } from '@builder.io/react';

const refs: Record<string, Element> = {};

if (Builder.isBrowser) {
  try {
    Array.from(document.querySelectorAll('.builder-static-content')).forEach(el => {
      const id = (el as HTMLDivElement).dataset.builderStaticId;
      if (id) {
        refs[id] = el;
      }
    });
  } catch (err) {
    console.error('Builder replace nodes error:', err);
  }
}

interface StaticContentProps {
  builderBlock?: BuilderElement;
}

const StaticContentComponent: React.SFC<StaticContentProps> = props => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Builder.isEditing || Builder.isPreviewing) {
      return;
    }

    const blockId = props.builderBlock?.id;
    if (blockId && refs[blockId] && ref.current) {
      ref.current.parentNode?.replaceChild(refs[blockId], ref.current);
    }
  }, []);

  return (
    <div
      className="builder-static-content"
      data-builder-static-id={props.builderBlock?.id}
      ref={ref}
    >
      {(Builder.isEditing || Builder.isPreviewing || Builder.isServer) &&
        props.builderBlock?.children &&
        props.builderBlock.children.map((block, index) => (
          <BuilderBlockComponent key={index + block.id!} block={block} />
        ))}
    </div>
  );
};

export const StaticContent = withBuilder(StaticContentComponent, {
  name: 'Shopify:StaticContent',
  canHaveChildren: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa21e7dbe14b5404fb5ef1a4a2808fe7e',
  description: 'Advanced component that preserves server rendered nodes, use with caution',
  defaultStyles: {
    // height: '200px',
    // how to disable styling
    marginTop: '0px',
    paddingBottom: '20px',
  },
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'center',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: '<p>wrap content that should be static</p>',
        },
      },
    },
  ],
});
