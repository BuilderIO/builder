import { useStore } from '@builder.io/mitosis';
import { evaluate } from '../../functions/evaluate/index.js';
import type { TextProps } from './text.types.js';

export default function Text(props: TextProps) {
  const state = useStore({
    get processedText(): string {
      console.log("KYLE ==================")
      console.log(props);
    
      const context = props.builderContext.value;
      const {
        context: contextContext,
        localState,
        rootState,
        rootSetState,
      } = context;
    
      console.log(context);
      return String(props.text || '').replace(
        /{{([^}]+)}}/g,
        (match, group) =>
          evaluate({
            code: group,
            context: contextContext,
            localState,
            rootState,
            rootSetState,
            enableCache: false,
          }) as string
      );
    },
  });

  return (
    <div
      class={
        /* NOTE: This class name must be "builder-text" for inline editing to work in the Builder editor */
        'builder-text'
      }
      innerHTML={state.processedText}
      style={{ outline: 'none' }}
    />
  );
}
