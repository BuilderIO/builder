import React, { useContext, useRef } from 'react';
import { Builder, builder, BuilderElement } from '@builder.io/sdk';
import { useEffect, useState } from 'react';
import { BuilderBlocks } from '../components/builder-blocks.component';
import {
  filterWithCustomTargeting,
  filterWithCustomTargetingScript,
  Query,
} from '../functions/filter-with-custom-targeting';
import { BuilderStoreContext } from '../store/builder-store';

export type PersonalizationContainerProps = {
  children: React.ReactNode;
  previewingIndex: number | null;
  builderBlock?: BuilderElement;
  builderState: any;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(isBeingHydrated);
  const [isHydrated, setIsHydrated] = useState(false);
  const [_, setUpdate] = useState(0);
  const builderStore = useContext(BuilderStoreContext);

  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
    const subscriber = builder.userAttributesChanged.subscribe(() => {
      setUpdate(prev => prev + 1);
    });
    let unsubs = [() => subscriber.unsubscribe()];

    if (!(Builder.isEditing || Builder.isPreviewing)) {
      const variant = filteredVariants[0];
      // fire a custom event to update the personalization container
      rootRef.current?.dispatchEvent(
        new CustomEvent('builder.variantLoaded', {
          detail: {
            variant: variant || 'default',
            content: builderStore.content,
          },
          bubbles: true,
        })
      );

      // add an intersection observer to fire a builder.variantDisplayed event when the container is in the viewport
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            rootRef.current?.dispatchEvent(
              new CustomEvent('builder.variantDisplayed', {
                detail: {
                  variant: variant || 'default',
                  content: builderStore.content,
                },
                bubbles: true,
              })
            );
          }
        });
      });

      observer.observe(rootRef.current!);
      unsubs.push(() => observer.disconnect());
    }

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  if (Builder.isServer) {
    return (
      <React.Fragment>
        <div
          {...props.attributes}
          // same as the client side styles for hydration matching
          style={{
            opacity: 1,
            transition: 'opacity 0.2s ease-in-out',
            ...props.attributes?.style,
          }}
          className={`builder-personalization-container ${props.attributes.className}`}
        >
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
            nonce={builderStore.context.nonce}
            id={`variants-script-${props.builderBlock?.id}`}
            dangerouslySetInnerHTML={{
              __html: getPersonalizationScript(
                props.variants,
                props.builderBlock?.id || 'none',
                props.builderState.state?.locale
              ),
            }}
          />
          <BuilderBlocks
            blocks={props.builderBlock?.children}
            parentElementId={props.builderBlock?.id}
            dataPath="this.children"
            child
          />
        </div>
        <script
          nonce={builderStore.context.nonce}
          dangerouslySetInnerHTML={{
            __html: `
         window.__hydrated = window.__hydrated || {};
         window.__hydrated['${props.builderBlock?.id}'] = true;
        `.replace(/\s+/g, ' '),
          }}
        />
      </React.Fragment>
    );
  }

  const filteredVariants = (props.variants || []).filter(variant => {
    return filterWithCustomTargeting(
      {
        ...(props.builderState.state?.locale ? { locale: props.builderState.state.locale } : {}),
        ...builder.getUserAttributes(),
      },
      variant.query,
      variant.startDate,
      variant.endDate
    );
  });

  return (
    <React.Fragment>
      <div
        ref={rootRef}
        {...props.attributes}
        style={{
          opacity: isClient ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          ...props.attributes?.style,
        }}
        className={`builder-personalization-container ${
          props.attributes.className
        }${isClient ? '' : ' builder-personalization-container-loading'}`}
      >
        {/* If editing a specific varient */}
        {isHydrated &&
        Builder.isEditing &&
        typeof props.previewingIndex === 'number' &&
        props.previewingIndex < (props.variants?.length || 0) ? (
          <BuilderBlocks
            blocks={props.variants?.[props.previewingIndex]?.blocks}
            parentElementId={props.builderBlock?.id}
            dataPath={`component.options.variants.${props.previewingIndex}.blocks`}
            child
          />
        ) : // If editing the default or we're on the server and there are no matching variants show the default
        (isHydrated && Builder.isEditing && typeof props.previewingIndex !== 'number') ||
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
      <script
        nonce={builderStore.context.nonce}
        dangerouslySetInnerHTML={{
          __html: `
         window.__hydrated = window.__hydrated || {};
         window.__hydrated['${props.builderBlock?.id}'] = true;
        `.replace(/\s+/g, ' '),
        }}
      />
    </React.Fragment>
  );
}

Builder.registerComponent(PersonalizationContainer, {
  name: 'PersonalizationContainer',
  noWrap: true,
  friendlyName: 'Dynamic Container',
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
          localized: false,
        },
        {
          name: 'query',
          friendlyName: 'Targeting rules',
          type: 'BuilderQuery',
          defaultValue: [],
          localized: false,
        },
        {
          name: 'startDate',
          type: 'date',
          localized: false,
        },
        {
          name: 'endDate',
          type: 'date',
          localized: false,
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

function getPersonalizationScript(
  variants: PersonalizationContainerProps['variants'],
  blockId: string,
  locale?: string
) {
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
            document.querySelector('template[data-variant-id="' + "${blockId}" + index + '"]').remove();
          });
          document.getElementById('variants-script-${blockId}').remove();
        }

        var attributes = JSON.parse(getCookie("${Builder.attributesCookieName}") || "{}");
        ${locale ? `attributes.locale = "${locale}";` : ''}
        var variants = ${JSON.stringify(variants?.map(v => ({ query: v.query, startDate: v.startDate, endDate: v.endDate })))};
        var winningVariantIndex = variants.findIndex(function(variant) {
          return filterWithCustomTargeting(
            attributes,
            variant.query,
            variant.startDate,
            variant.endDate
          );
        });
        var isDebug = location.href.includes('builder.debug=true');
        if (isDebug) {
          console.debug('PersonalizationContainer', {
            attributes: attributes,
            variants: variants,
            winningVariantIndex: winningVariantIndex,
            });
        }
        if (winningVariantIndex !== -1) {
          var winningVariant = document.querySelector('template[data-variant-id="' + "${blockId}" + winningVariantIndex + '"]');
          if (winningVariant) {
            var parentNode = winningVariant.parentNode;
            var newParent = parentNode.cloneNode(false);
            newParent.appendChild(winningVariant.content.firstChild);
            parentNode.parentNode.replaceChild(newParent, parentNode);
            if (isDebug) {
              console.debug('PersonalizationContainer', 'Winning variant Replaced:', winningVariant);
            }
          }
        } else if (variants.length > 0) {
          removeVariants();
        }
        ${filterWithCustomTargetingScript}
      })();
    `.replace(/\s+/g, ' ');
}
