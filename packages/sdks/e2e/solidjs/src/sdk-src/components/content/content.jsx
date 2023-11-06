import { Show, createSignal } from "solid-js";

import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";
import {
  components,
  serializeComponentInfo,
} from "../../functions/register-component.js";
import Blocks from "../blocks/blocks";
import ContentStyles from "./components/styles";
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from "./content.helpers.js";
import { TARGET } from "../../constants/target.js";
import { getRenderContentScriptString } from "../content-variants/helpers.js";
import EnableEditor from "./components/enable-editor";
import InlinedScript from "../inlined-script";
import { wrapComponentRef } from "./wrap-component-ref.js";
import ComponentsContext from "../../context/components.context.js";

function ContentComponent(props) {
  const [scriptStr, setScriptStr] = createSignal(
    getRenderContentScriptString({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variationId: props.content?.testVariationId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id,
    })
  );

  const [registeredComponents, setRegisteredComponents] = createSignal(
    [
      ...getDefaultRegisteredComponents(), // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce(
      (acc, { component, ...info }) => ({
        ...acc,
        [info.name]: {
          component: component,
          ...serializeComponentInfo(info),
        },
      }),
      {}
    )
  );

  const [builderContextSignal, setBuilderContextSignal] = createSignal({
    content: getContentInitialValue({
      content: props.content,
      data: props.data,
    }),
    localState: undefined,
    rootState: getContextStateInitialValue({
      content: props.content,
      data: props.data,
      locale: props.locale,
    }),
    rootSetState: contentSetState,
    context: props.context || {},
    apiKey: props.apiKey,
    apiVersion: props.apiVersion,
    componentInfos: [
      ...getDefaultRegisteredComponents(), // While this `components` object is deprecated, we must maintain support for it.
      // Since users are able to override our default components, we need to make sure that we do not break such
      // existing usage.
      // This is why we spread `components` after the default Builder.io components, but before the `props.customComponents`,
      // which is the new standard way of providing custom components, and must therefore take precedence.
      ...components,
      ...(props.customComponents || []),
    ].reduce(
      (acc, { component: _, ...info }) => ({
        ...acc,
        [info.name]: serializeComponentInfo(info),
      }),
      {}
    ),
    inheritedStyles: {},
  });

  function contentSetState(newRootState) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      rootState: newRootState,
    }));
  }

  return (
    <ComponentsContext.Provider
      value={{
        registeredComponents: registeredComponents(),
      }}
    >
      <EnableEditor
        content={props.content}
        model={props.model}
        context={props.context}
        apiKey={props.apiKey}
        canTrack={props.canTrack}
        locale={props.locale}
        includeRefs={props.includeRefs}
        enrich={props.enrich}
        classNameProp={props.classNameProp}
        showContent={props.showContent}
        builderContextSignal={builderContextSignal()}
        {...{
          setBuilderContextSignal: setBuilderContextSignal,
        }}
      >
        <Show when={props.isSsrAbTest}>
          <InlinedScript scriptStr={scriptStr()}></InlinedScript>
        </Show>
        <Show when={TARGET !== "reactNative"}>
          <ContentStyles
            contentId={builderContextSignal().content?.id}
            cssCode={builderContextSignal().content?.data?.cssCode}
            customFonts={builderContextSignal().content?.data?.customFonts}
          ></ContentStyles>
        </Show>
        <Blocks
          blocks={builderContextSignal().content?.data?.blocks}
          context={builderContextSignal()}
          registeredComponents={registeredComponents()}
        ></Blocks>
      </EnableEditor>
    </ComponentsContext.Provider>
  );
}

export default ContentComponent;
