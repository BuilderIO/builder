import { getDefaultRegisteredComponents } from "../../constants/builder-registered-components.js";

import { TARGET } from "../../constants/target.js";

import builderContext from "../../context/builder.context";

import {
  BuilderRenderState,
  RegisteredComponent,
  RegisteredComponents,
} from "../../context/types.js";

import { evaluate } from "../../functions/evaluate.js";

import { getContent } from "../../functions/get-content/index.js";

import { fetch } from "../../functions/get-fetch.js";

import { isBrowser } from "../../functions/is-browser.js";

import { isEditing } from "../../functions/is-editing.js";

import { isPreviewing } from "../../functions/is-previewing.js";

import {
  components,
  createRegisterComponentMessage,
} from "../../functions/register-component.js";

import { _track } from "../../functions/track/index.js";

import { getInteractionPropertiesForEvent } from "../../functions/track/interaction.js";

import { checkIsDefined } from "../../helpers/nullable.js";

import {
  registerInsertMenu,
  setupBrowserForEditing,
} from "../../scripts/init-editing.js";

import { Breakpoints, BuilderContent } from "../../types/builder-content.js";

import { Nullable } from "../../types/typescript.js";
import RenderBlock from "../render-block/render-block.js";

import RenderBlocks from "../render-blocks";

import RenderContentStyles from "./components/render-styles";

import {
  getContentInitialValue,
  getContextStateInitialValue,
} from "./render-content.helpers.js";

import {
  BuilderComponentStateChange,
  RenderContentProps,
} from "./render-content.types.js";

import {
  Fragment,
  component$,
  h,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";


export const RenderContent = component$((props: RenderContentProps) => {
  const state = useStore<any>(
    {
      allRegisteredComponents: [
        ...getDefaultRegisteredComponents(),
        ...(props.customComponents || []),
      ].reduce(
        (acc, curr) => ({
          ...acc,
          [curr.name]: curr,
        }),
        {} as RegisteredComponents
      ),
      useContent: getContentInitialValue({
        content: props.content,
        data: props.data,
      }),
    },
    { deep: true }
  );
  const bdctx =     useStore({
    content: state.useContent,
    state: {},
    context:  {},
    apiKey: 'a',
    apiVersion: undefined,
    registeredComponents: state.allRegisteredComponents,
    inheritedStyles: {}
  })
  useContextProvider(
    builderContext,
    bdctx
  );
  useVisibleTask$(() => {
  });

  return (
    <>
      {state.useContent ? (
        <RenderBlocks
        blocks={state.useContent?.data?.blocks}
        key={state.forceReRenderCount}
      ></RenderBlocks>
      
      ) : null}
    </>
  );
});

export default RenderContent;
