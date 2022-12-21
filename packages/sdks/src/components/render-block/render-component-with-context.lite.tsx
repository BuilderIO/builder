import BuilderContext from '../../context/builder.context.lite';
import { setContext } from '@builder.io/mitosis';
import type { RenderComponentProps } from './render-component.lite';
import RenderComponent from './render-component.lite';

export default function RenderComponentWithContext(
  props: RenderComponentProps
) {
  /**
   * We cannot set context in `RenderComponent` because it's a light Qwik component. We only need to set the context for
   * a React Native need: CSS-style inheritance for Text blocks. So we're setting the context here, and making sure not to
   * render this component in Qwik.
   */
  setContext(BuilderContext, {
    content: props.context.content,
    state: props.context.state,
    context: props.context.context,
    apiKey: props.context.apiKey,
    registeredComponents: props.context.registeredComponents,
    inheritedStyles: props.context.inheritedStyles,
  });
  return (
    <RenderComponent
      componentRef={props.componentRef}
      componentOptions={props.componentOptions}
      blockChildren={props.blockChildren}
      context={props.context}
    />
  );
}
