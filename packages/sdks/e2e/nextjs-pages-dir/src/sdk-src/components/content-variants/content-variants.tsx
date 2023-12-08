'use client';
import * as React from 'react';
import { useEffect } from 'react';
import { TARGET } from '../../constants/target';
import { handleABTestingSync } from '../../helpers/ab-tests';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import ContentComponent from '../content/content';
import InlinedScript from '../inlined-script';
import InlinedStyles from '../inlined-styles';
import type { ContentVariantsPrps } from './content-variants.types';
import {
  checkShouldRunVariants,
  getScriptString,
  getVariants,
  getVariantsScriptString,
} from './helpers';

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};

function ContentVariants(props: VariantsProviderProps) {
  const shouldRenderVariants = checkShouldRunVariants({
    canTrack: getDefaultCanTrack(props.canTrack),
    content: props.content,
  });

  console.log('ContentVariants:', {
    shouldRenderVariants,
    window: typeof window !== 'undefined' ? window : null,
  });

  function variantScriptStr() {
    return getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    );
  }

  function hideVariantsStyleString() {
    return getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join('');
  }

  function defaultContent() {
    return shouldRenderVariants
      ? {
          ...props.content,
          testVariationId: props.content?.id,
        }
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        });
  }

  /**
   * logs this entire component's HTML
   */
  const printNode = `
    if (typeof window !== 'undefined') {
      let k = (document.currentScript?.parentElement.outerHTML);

      console.log(k)
    }
  `;

  useEffect(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
  }, []);

  return (
    <>
      {!props.__isNestedRender && TARGET !== 'reactNative' ? (
        <>
          <InlinedScript scriptStr={getScriptString()} />
        </>
      ) : null}

      {shouldRenderVariants ? (
        <>
          <InlinedStyles
            id={`variants-styles-${props.content?.id}`}
            styles={hideVariantsStyleString()}
          />
          <InlinedScript scriptStr={variantScriptStr()} />
          {getVariants(props.content)?.map((variant) => (
            <ContentComponent
              key={variant.testVariationId}
              content={variant}
              showContent={false}
              classNameProp={undefined}
              model={props.model}
              data={props.data}
              context={props.context}
              apiKey={props.apiKey}
              apiVersion={props.apiVersion}
              customComponents={props.customComponents}
              canTrack={props.canTrack}
              locale={props.locale}
              includeRefs={props.includeRefs}
              enrich={props.enrich}
              isSsrAbTest={shouldRenderVariants}
            />
          ))}
        </>
      ) : null}

      <ContentComponent
        {...{}}
        content={defaultContent()}
        classNameProp={`variant-${props.content?.id}`}
        showContent={true}
        model={props.model}
        data={props.data}
        context={props.context}
        apiKey={props.apiKey}
        apiVersion={props.apiVersion}
        customComponents={props.customComponents}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        isSsrAbTest={shouldRenderVariants}
      />

      <InlinedScript scriptStr={printNode} />
    </>
  );
}

export default ContentVariants;
