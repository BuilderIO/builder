import React, { useEffect, useRef } from 'react';
import { BuilderElement, Builder } from '@builder.io/sdk';
import { BuilderBlockComponent, withBuilder } from '@builder.io/react';

const refs: Record<string, Element> = {};

if (Builder.isBrowser) {
  try {
    Array.from(document.querySelectorAll('.builder-static-content')).forEach(el => {
      const id = (el as HTMLDivElement).dataset.builderId;
      if (id) {
        // TODO: keep array of these for lists
        refs[id] = el;
        el.remove();
      }
    });
  } catch (err) {
    console.error('Builder replace nodes error:', err);
  }
}

interface StaticLiquidProps {
  builderBlock?: BuilderElement;
}

const StaticLiquidComponent: React.SFC<StaticLiquidProps> = props => {
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
    <div className="builder-static-content" data-builder-id={props.builderBlock?.id} ref={ref}>
      {(Builder.isEditing || Builder.isPreviewing) &&
        props.builderBlock &&
        props.builderBlock.children &&
        props.builderBlock.children.map(block => (
          <BuilderBlockComponent key={block.id} block={block} />
        ))}
    </div>
  );
};

export const StaticLiquid = withBuilder(StaticLiquidComponent, {
  name: 'Core:StaticLiquid',
  static: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc312e4bf11b64af0b43958aab099b927',
  canHaveChildren: true,
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
