import React from 'react';
import { Builder, builder, BuilderElement } from '@builder.io/sdk';
import { useEffect, useState } from 'react';
import { BuilderBlocks } from '../components/builder-blocks.component';

type UserAttributes = any;
type Query = any;

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
};

export function PersonalizationContainer(props: PersonalizationContainerProps) {
  const [isClient, setIsClient] = useState(false);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
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

export function filterWithCustomTargeting(
  userAttributes: UserAttributes,
  query: Query[],
  startDate?: string,
  endDate?: string
) {
  const item = {
    query,
    startDate,
    endDate,
  };

  const now = (userAttributes.date && new Date(userAttributes.date)) || new Date();

  if (item.startDate && new Date(item.startDate) > now) {
    return false;
  } else if (item.endDate && new Date(item.endDate) < now) {
    return false;
  }

  if (!item.query || !item.query.length) {
    return true;
  }

  return item.query.every((filter: Query) => {
    if (
      filter &&
      filter.property === 'urlPath' &&
      filter.value &&
      typeof filter.value === 'string' &&
      filter.value !== '/' &&
      filter.value.endsWith('/')
    ) {
      filter.value = filter.value.slice(0, -1);
    }
    return objectMatchesQuery(userAttributes, filter);
  });

  function isNumber(val: unknown) {
    return typeof val === 'number';
  }

  function isString(val: unknown) {
    return typeof val === 'string';
  }

  function objectMatchesQuery(userattr: UserAttributes, query: Query): boolean {
    const result = (() => {
      const property = query.property;
      const operator = query.operator;
      const testValue = query.value;

      // Check is query property is present in userAttributes. Proceed only if it is present.
      if (!(property && operator)) {
        return true;
      }

      if (Array.isArray(testValue)) {
        if (operator === 'isNot') {
          return testValue.every(val =>
            objectMatchesQuery(userattr, { property, operator, value: val })
          );
        }
        return !!testValue.find(val =>
          objectMatchesQuery(userattr, { property, operator, value: val })
        );
      }
      const value = userattr[property];

      if (Array.isArray(value)) {
        return value.includes(testValue);
      }

      switch (operator) {
        case 'is':
          return value === testValue;
        case 'isNot':
          return value !== testValue;
        case 'contains':
          return (isString(value) || Array.isArray(value)) && value.includes(testValue);
        case 'startsWith':
          return isString(value) && value.startsWith(testValue);
        case 'endsWith':
          return isString(value) && value.endsWith(testValue);
        case 'greaterThan':
          return isNumber(value) && isNumber(testValue) && value > testValue;
        case 'lessThan':
          return isNumber(value) && isNumber(testValue) && value < testValue;
        case 'greaterThanOrEqualTo':
          return isNumber(value) && isNumber(testValue) && value >= testValue;
        case 'lessThanOrEqualTo':
          return isNumber(value) && isNumber(testValue) && value <= testValue;
      }
      return false;
    })();

    return result;
  }
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
  ],
});
