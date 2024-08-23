import {
  onMount,
  useMetadata,
  useRef,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import { isEditing } from '../../functions/is-editing.js';
import type { BuilderBlock } from '../../types/builder-block.js';

useMetadata({
  rsc: {
    componentType: 'client',
  },
  elementTag: 'props.BlocksWrapper',
});

export type BlocksWrapperProps = {
  blocks: BuilderBlock[] | undefined;
  parent: string | undefined;
  path: string | undefined;
  styleProp: Record<string, any> | undefined;
  /**
   * The element that wraps each list of blocks. Defaults to a `div` element ('ScrollView' in React Native).
   */
  BlocksWrapper: any;
  /**
   * Additonal props to pass to `blocksWrapper`. Defaults to `{}`.
   */
  BlocksWrapperProps: any;

  children?: any;
};

export default function BlocksWrapper(props: BlocksWrapperProps) {
  const blocksWrapperRef = useRef<HTMLDivElement>();
  const state = useStore({
    get className() {
      return 'builder-blocks' + (!props.blocks?.length ? ' no-blocks' : '');
    },
    onClick() {
      if (isEditing() && !props.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.clickEmptyBlocks',
            data: {
              parentElementId: props.parent,
              dataPath: props.path,
            },
          },
          '*'
        );
      }
    },
    onMouseEnter() {
      if (isEditing() && !props.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.hoverEmptyBlocks',
            data: {
              parentElementId: props.parent,
              dataPath: props.path,
            },
          },
          '*'
        );
      }
    },
  });

  onMount(() => {
    useTarget({
      reactNative: () => {
        if (isEditing()) {
          /**
           * React Native strips off custom HTML attributes, so we have to manually set them here
           * to ensure that blocks are correctly dropped into the correct parent.
           */
          props.path &&
            blocksWrapperRef.setAttribute('builder-path', props.path);
          props.parent &&
            blocksWrapperRef.setAttribute('builder-parent-id', props.parent);
        }
      },
      default: () => {},
    });
  });

  return (
    <props.BlocksWrapper
      ref={blocksWrapperRef}
      class={state.className}
      builder-path={props.path}
      builder-parent-id={props.parent}
      {...useTarget({
        reactNative: { dataSet: { class: state.className } },
        default: {},
      })}
      style={props.styleProp}
      // eslint-disable-next-line @builder.io/mitosis/css-no-vars
      css={useTarget({
        // react native's ScrollView can't accept `alignItems` in styles.
        reactNative: {
          display: 'flex',
          flexDirection: 'column',
        },
        default: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        },
      })}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick={(event: any) => state.onClick()}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onMouseEnter={(event: any) => state.onMouseEnter()}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onKeyPress={(event: any) => state.onClick()}
      {...props.BlocksWrapperProps}
    >
      {props.children}
    </props.BlocksWrapper>
  );
}
