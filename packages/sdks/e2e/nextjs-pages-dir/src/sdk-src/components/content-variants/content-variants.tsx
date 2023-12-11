'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { TARGET } from '../../constants/target';
import { handleABTestingSync } from '../../helpers/ab-tests';
import { getDefaultCanTrack } from '../../helpers/canTrack';
import ContentComponent from '../content/content';
import InlinedScript from '../inlined-script';
import InlinedStyles from '../inlined-styles';
import type { ContentVariantsPrps } from './content-variants.types';
import {
  checkShouldRenderVariants,
  getScriptString,
  getUpdateCookieAndStylesScript,
  getVariants,
} from './helpers';

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};

function ContentVariants(props: VariantsProviderProps) {
  const [shouldRenderVariants, setShouldRenderVariants] = useState(() =>
    checkShouldRenderVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    })
  );

  function updateCookieAndStylesScriptStr() {
    return getUpdateCookieAndStylesScript(
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
          <InlinedScript scriptStr={updateCookieAndStylesScriptStr()} />
          {getVariants(props.content)?.map((variant) => (
            <ContentComponent
              key={variant.testVariationId}
              content={variant}
              showContent={false}
              classNameProp={`variant-${variant.testVariationId}`}
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

      <script
        dangerouslySetInnerHTML={{
          __html: `console.log(document.currentScript.parentElement.innerHTML)`,
        }}
      ></script>
    </>
  );
}

export default ContentVariants;
