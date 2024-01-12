import * as React from "react";
import {
  FlatList,
  ScrollView,
  View,
  StyleSheet,
  Image,
  Text,
} from "react-native";
import { useState, useContext } from "react";
import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";
import { TARGET } from "../../constants/target.js";
import ComponentsContext from "../../context/components.context.js";
import {
  components,
  serializeComponentInfo,
} from "../../functions/register-component.js";
import Blocks from "../blocks/blocks";
import { getUpdateVariantVisibilityScript } from "../content-variants/helpers.js";
import InlinedScript from "../inlined-script";
import EnableEditor from "./components/enable-editor";
import ContentStyles from "./components/styles";
import {
  getContentInitialValue,
  getContextStateInitialValue,
} from "./content.helpers.js";
import { wrapComponentRef } from "./wrap-component-ref.js";

function ContentComponent(props) {
  const [scriptStr, setScriptStr] = useState(() =>
    getUpdateVariantVisibilityScript({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      variationId: props.content?.testVariationId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      contentId: props.content?.id,
    })
  );

  function contentSetState(newRootState) {
    setBuilderContextSignal((PREVIOUS_VALUE) => ({
      ...PREVIOUS_VALUE,
      rootState: newRootState,
    }));
  }

  const [registeredComponents, setRegisteredComponents] = useState(() =>
    [
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
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

  const [builderContextSignal, setBuilderContextSignal] = useState(() => ({
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
      ...getDefaultRegisteredComponents(),
      // While this `components` object is deprecated, we must maintain support for it.
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
    BlocksWrapper: props.blocksWrapper || ScrollView,
    BlocksWrapperProps: props.blocksWrapperProps || {},
  }));

  return (
    <ComponentsContext.Provider
      value={{
        registeredComponents: registeredComponents,
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
        showContent={props.showContent}
        builderContextSignal={builderContextSignal}
        {...{
          setBuilderContextSignal: setBuilderContextSignal,
        }}
      >
        {props.isSsrAbTest ? (
          <>
            <InlinedScript scriptStr={scriptStr} />
          </>
        ) : null}

        {TARGET !== "reactNative" ? (
          <>
            <ContentStyles
              contentId={builderContextSignal.content?.id}
              cssCode={builderContextSignal.content?.data?.cssCode}
              customFonts={builderContextSignal.content?.data?.customFonts}
            />
          </>
        ) : null}

        <Blocks
          blocks={builderContextSignal.content?.data?.blocks}
          context={builderContextSignal}
          registeredComponents={registeredComponents}
        />
      </EnableEditor>
    </ComponentsContext.Provider>
  );
}

export default ContentComponent;
