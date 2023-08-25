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

import {
  Fragment,
  component$,
  useComputed$,
  useStore,
  useVisibleTask$,
} from '@builder.io/qwik';

type VariantsProviderProps = ContentVariantsPrps & {
  /**
   * For internal use only. Do not provide this prop.
   */
  __isNestedRender?: boolean;
};
export const ContentVariants = component$((props: VariantsProviderProps) => {
  const state = useStore<any>({
    shouldRenderVariants: checkShouldRunVariants({
      canTrack: getDefaultCanTrack(props.canTrack),
      content: props.content,
    }),
  });
  const variantScriptStr = useComputed$(() => {
    return getVariantsScriptString(
      getVariants(props.content).map((value) => ({
        id: value.testVariationId!,
        testRatio: value.testRatio,
      })),
      props.content?.id || ''
    );
  });
  const hideVariantsStyleString = useComputed$(() => {
    return getVariants(props.content)
      .map((value) => `.variant-${value.testVariationId} { display: none; } `)
      .join('');
  });
  const defaultContent = useComputed$(() => {
    return state.shouldRenderVariants
      ? {
          ...props.content,
          testVariationId: props.content?.id,
        }
      : handleABTestingSync({
          item: props.content,
          canTrack: getDefaultCanTrack(props.canTrack),
        });
  });
  useVisibleTask$(() => {
    /**
     * We unmount the non-winning variants post-hydration in Vue.
     */
  });

  return (
    <Fragment>
      {!props.__isNestedRender && TARGET !== 'reactNative' ? (
        <InlinedScript scriptStr={getScriptString()}></InlinedScript>
      ) : null}
      {state.shouldRenderVariants ? (
        <>
          <InlinedStyles
            id={`variants-styles-${props.content?.id}`}
            styles={hideVariantsStyleString.value}
          ></InlinedStyles>
          <InlinedScript scriptStr={variantScriptStr.value}></InlinedScript>
          {(getVariants(props.content) || []).map((variant) => {
            return (
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
                isSsrAbTest={state.shouldRenderVariants}
              ></ContentComponent>
            );
          })}
        </>
      ) : null}
      <ContentComponent
        {...{}}
        content={defaultContent.value}
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
        isSsrAbTest={state.shouldRenderVariants}
      ></ContentComponent>
    </Fragment>
  );
});

export default ContentVariants;
