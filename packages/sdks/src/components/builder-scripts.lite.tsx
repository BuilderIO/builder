import {
  setContext,
  Show,
  useContext,
  useMetadata,
  useStore,
} from '@builder.io/mitosis';
import {
  getInitPersonalizationVariantsFnsScriptString,
  SDKS_SUPPORTING_PERSONALIZATION,
} from '../blocks/personalization-container/helpers.js';
import { TARGET } from '../constants/target.js';
import BuilderScriptsContext from '../context/builder-scripts.context.lite.js';
import {
  getInitVariantsFnsScriptString,
  SDKS_SUPPORTING_BUILDER_SCRIPTS,
} from './content-variants/helpers.js';
import InlinedScript from './inlined-script.lite.jsx';

useMetadata({
  rsc: {
    componentType: 'client',
  },
  angular: {
    selector: 'builder-scripts',
  },
});

type BuilderScriptsProps = {
  nonce?: string;
  children?: any;
};

/**
 * Emits the Variant Container and A/B test helper scripts once for all `Content` components inside it.
 */
export default function BuilderScripts(props: BuilderScriptsProps) {
  const parentScriptsContext = useContext(BuilderScriptsContext);

  const state = useStore({
    isSupported: SDKS_SUPPORTING_BUILDER_SCRIPTS.includes(TARGET),
  });

  setContext(BuilderScriptsContext, {
    scriptsEmitted: state.isSupported,
  });

  return (
    <>
      <Show when={state.isSupported && !parentScriptsContext?.scriptsEmitted}>
        <Show when={SDKS_SUPPORTING_PERSONALIZATION.includes(TARGET)}>
          <InlinedScript
            nonce={props.nonce || ''}
            scriptStr={getInitPersonalizationVariantsFnsScriptString()}
            id="builderio-init-personalization-variants-fns"
          />
        </Show>
        <InlinedScript
          nonce={props.nonce || ''}
          scriptStr={getInitVariantsFnsScriptString()}
          id="builderio-init-variants-fns"
        />
      </Show>
      {props.children}
    </>
  );
}
