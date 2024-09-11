import React from 'react';
import { Builder, builder, BuilderElement } from '@builder.io/sdk';
import { useEffect, useState } from 'react';
import { BuilderBlocks } from '../components/builder-blocks.component';
import {
  filterWithCustomTargeting,
  filterWithCustomTargetingScript,
  Query,
} from '../functions/filter-with-custom-targeting';

const attributesCookie = 'builder.attributes';

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
  const isBeingHydrated = Boolean(
    Builder.isBrowser && (window as any).__hydrated?.[props.builderBlock?.id!]
  );
  const [isClient, setIsClient] = useState(isBeingHydrated);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const subscriber = builder.userAttributesChanged.subscribe(() => {
      builder.setCookie(attributesCookie, JSON.stringify(builder.getUserAttributes()));
      setUpdate(update + 1);
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, []);

  if (Builder.isServer) {
    return (
      <>
        {props.variants?.map((variant, index) => (
          <template key={index} data-variant-id={props.builderBlock?.id! + index}>
            <BuilderBlocks
              blocks={variant.blocks}
              parentElementId={props.builderBlock?.id}
              dataPath={`component.options.variants.${index}.blocks`}
              child
            />
          </template>
        ))}
        <script
          id={`variants-script-${props.builderBlock?.id}`}
          dangerouslySetInnerHTML={{ __html: getPersonalizationScript(props) }}
        />
        <div
          {...props.attributes}
          data-default-variant-id={props.builderBlock?.id}
          className={`builder-personalization-container ${props.attributes.className}`}
        >
          <BuilderBlocks
            blocks={props.builderBlock?.children}
            parentElementId={props.builderBlock?.id}
            dataPath="this.children"
            child
          />
        </div>
      </>
    );
  }

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

      <script
        dangerouslySetInnerHTML={{
          __html: `
         window.__hydrated = window.__hydrated || {};
         window.__hydrated['${props.builderBlock?.id}'] = true;
        `.replace(/\s+/g, ' '),
        }}
      />
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
  ],
});

function getPersonalizationScript(props: PersonalizationContainerProps) {
  return `
      (function() {
        function getCookie(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for(var i=0;i < ca.length;i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1,c.length);
              if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
          }
          return null;
        }
          function removeVariants() {
            variants.forEach(function (template, index) {
              document.querySelector('template[data-variant-id="' + "${props.builderBlock?.id}" + index + '"]').remove();
            });
            document.getElementById('variants-script-${props.builderBlock?.id}').remove();
          }

        var attributes = JSON.parse(getCookie("${attributesCookie}") || "{}");
        var variants = ${JSON.stringify(props.variants?.map(v => ({ query: v.query, startDate: v.startDate, endDate: v.endDate })))};
        var winningVariantIndex = variants.findIndex(function(variant) {
          return filterWithCustomTargeting(
            attributes,
            variant.query,
            variant.startDate,
            variant.endDate
          );
        });
        if (winningVariantIndex !== -1) {
          var winningVariant = document.querySelector('template[data-variant-index="' + "${props.builderBlock?.id}" + winningVariantIndex + '"]');
          if (winningVariant) {
            var parentNode = winningVariant.parentNode;
            var newParent = parentNode.cloneNode(false);
            newParent.appendChild(winningVariant.content.firstChild);
            parentNode.parentNode.replaceChild(newParent, parentNode);
          }
        } else if (variants.length > 0) {
          removeVariants();
        }
        ${filterWithCustomTargetingScript}
      })();
    `.replace(/\s+/g, ' ');
}
