import React from 'react';
import { Builder, builder, BuilderElement } from '@builder.io/sdk';
import { useEffect, useState } from 'react';
import { BuilderBlocks } from '../components/builder-blocks.component';
import { filterWithCustomTargeting, Query } from '../functions/filter-with-custom-targeting';

export type PersonalizationContainerProps = {
  children: React.ReactNode;
  previewingIndex: number | null;
  builderBlock?: BuilderElement;
  variants?: [
    {
      query: Query[];
      startDate?: string;
      endDate?: string;
      blocks: BuilderElement[];
    },
  ];
  attributes: any;
  clientSideOnly?: boolean;
};

export function PersonalizationContainer(props: PersonalizationContainerProps) {
  const [isClient, setIsClient] = useState(!props.clientSideOnly);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const subscriber = builder.userAttributesChanged.subscribe(() => {
      setUpdate(update + 1);
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, []);

  const filteredVariants = (props.variants || []).filter(variant => {
    return filterWithCustomTargeting(
      builder.getUserAttributes(),
      variant.query,
      variant.startDate,
      variant.endDate
    );
  });

  return (
    <div
      {...props.attributes}
      style={{
        opacity: isClient ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        ...props.attributes?.style,
      }}
      className={`builder-personalization-container ${
        props.attributes.className
      } ${isClient ? '' : 'builder-personalization-container-loading'}`}
    >
      {/* If editing a specific varient */}
      {Builder.isEditing &&
      typeof props.previewingIndex === 'number' &&
      props.previewingIndex < (props.variants?.length || 0) ? (
        <BuilderBlocks
          blocks={props.variants?.[props.previewingIndex]?.blocks}
          parentElementId={props.builderBlock?.id}
          dataPath={`component.options.variants.${props.previewingIndex}.blocks`}
          child
        />
      ) : // If editing the default or we're on the server and there are no matching variants show the default
      (Builder.isEditing && typeof props.previewingIndex !== 'number') ||
        !isClient ||
        !filteredVariants.length ? (
        <BuilderBlocks
          blocks={props.builderBlock?.children}
          parentElementId={props.builderBlock?.id}
          dataPath="this.children"
          child
        />
      ) : (
        // Show the variant matching the current user attributes
        <BuilderBlocks
          blocks={filteredVariants[0]?.blocks}
          parentElementId={props.builderBlock?.id}
          dataPath={`component.options.variants.${props.variants?.indexOf(
            filteredVariants[0]
          )}.blocks`}
          child
        />
      )}
    </div>
  );
}

Builder.registerComponent(PersonalizationContainer, {
  name: 'PersonalizationContainer',
  noWrap: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F37229ed30d8c41dfb10b8cca1992053a',
  canHaveChildren: true,
  inputs: [
    {
      name: 'variants',
      defaultValue: [],
      behavior: 'personalizationVariantList',
      type: 'list',
      subFields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'query',
          friendlyName: 'Targeting rules',
          type: 'BuilderQuery',
          defaultValue: [],
        },
        {
          name: 'startDate',
          type: 'date',
        },
        {
          name: 'endDate',
          type: 'date',
        },
        {
          name: 'blocks',
          type: 'UiBlocks',
          hideFromUI: true,
          defaultValue: [],
        },
      ],
    },
    {
      name: 'clientSideOnly',
      type: 'boolean',
      advanced: true,
    },
  ],
});
