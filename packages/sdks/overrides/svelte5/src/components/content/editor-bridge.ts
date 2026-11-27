/**
 * Visual editor and preview support for `<Content>`. Loaded with a dynamic `import()` only inside
 * the Builder editor or a preview link, so visitors never download it.
 */
import type { BuilderContextInterface } from '../../context/types.js';
import { fastClone } from '../../functions/fast-clone.js';
import { fetchOneEntry } from '../../functions/get-content/index.js';
import { createRegisterComponentMessage } from '../../functions/register-component.js';
import { createEditorListener } from '../../helpers/subscribe-to-editor.js';
import { setupBrowserForEditing } from '../../scripts/init-editing.js';
import type { ComponentInfo } from '../../types/components.js';
import { triggerAnimation } from '../block/animator.js';
import type { BuilderComponentStateChange, ContentProps } from './content.types.js';

type BridgeProps = Partial<Pick<
  ContentProps,
  | 'model'
  | 'apiKey'
  | 'locale'
  | 'enrich'
  | 'enrichOptions'
  | 'trustedHosts'
  | 'content'
  | 'context'
>>;

export type Bridge = {
  getProps: () => BridgeProps;
  context: BuilderContextInterface;
  mergeNewContent: (content: Partial<NonNullable<ContentProps['content']>>) => void;
  mergeNewRootState: (state: Record<string, unknown>) => void;
};

/** Emits the root state to the editor's state panel. */
export function emitStateUpdate(context: BuilderContextInterface, model: string | undefined) {
  window.dispatchEvent(
    new CustomEvent<BuilderComponentStateChange>('builder:component:stateChange', {
      detail: { state: fastClone(context.rootState), ref: { name: model } },
    })
  );
}

/** Connects a `<Content>` to the visual editor. Returns the cleanup. */
export function startEditing(bridge: Bridge): () => void {
  const props = bridge.getProps();

  const processMessage = (event: MessageEvent) =>
    createEditorListener({
      model: bridge.getProps().model!,
      trustedHosts: bridge.getProps().trustedHosts,
      callbacks: {
        configureSdk: (messageContent) => {
          const { breakpoints, contentId } = messageContent;
          if (!contentId || contentId !== bridge.context.content?.id) return;
          if (breakpoints) bridge.mergeNewContent({ meta: { breakpoints } });
        },
        animation: (animation) => triggerAnimation(animation),
        contentUpdate: (newContent) => bridge.mergeNewContent(newContent),
        stateUpdate: (newState) => bridge.mergeNewRootState(newState),
      },
    })(event);

  const onStateListenerActivated = () => emitStateUpdate(bridge.context, bridge.getProps().model);

  window.addEventListener('message', processMessage);

  setupBrowserForEditing({
    ...(props.locale ? { locale: props.locale } : {}),
    ...(props.enrich ? { enrich: props.enrich } : {}),
    ...(props.enrichOptions ? { enrichOptions: props.enrichOptions } : {}),
    ...(props.trustedHosts ? { trustedHosts: props.trustedHosts } : {}),
    modelName: props.model ?? '',
    apiKey: props.apiKey!,
  });

  Object.values<ComponentInfo>(bridge.context.componentInfos).forEach((info) => {
    if (!info.models?.length || info.models.includes(props.model!)) {
      window.parent?.postMessage(createRegisterComponentMessage(info), '*');
    }
  });

  window.addEventListener('builder:component:stateChangeListenerActivated', onStateListenerActivated);

  return () => {
    window.removeEventListener('message', processMessage);
    window.removeEventListener(
      'builder:component:stateChangeListenerActivated',
      onStateListenerActivated
    );
  };
}

/** In a preview link (not the editor): fetches the draft content and shows it. */
export function startPreviewing(bridge: Bridge) {
  const props = bridge.getProps();
  const searchParams = new URL(location.href).searchParams;
  const previewModel = searchParams.get('builder.preview');
  const previewId = searchParams.get(`builder.overrides.${previewModel}`);
  const previewApiKey = searchParams.get('apiKey') || searchParams.get('builder.space');

  if (
    previewModel === 'BUILDER_STUDIO' ||
    (previewModel === props.model &&
      previewApiKey === props.apiKey &&
      (!props.content || previewId === props.content.id))
  ) {
    fetchOneEntry({
      model: props.model!,
      apiKey: props.apiKey!,
      apiVersion: bridge.context.apiVersion,
      ...(props.locale ? { locale: props.locale } : {}),
      ...(previewModel === 'BUILDER_STUDIO' && props.context?.symbolId
        ? { query: { id: props.context.symbolId } }
        : {}),
    }).then((content) => {
      if (content) bridge.mergeNewContent(content);
    });
  }
}
