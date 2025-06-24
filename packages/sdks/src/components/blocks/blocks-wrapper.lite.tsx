import {
  onMount,
  onUpdate,
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
   * Props to be applied to the wrapping element of blocks. Can be set in two ways:
   * 1. Globally via `<Content blocksWrapperProps={{...}}/>` - applies to all blocks wrappers in the Content
   * 2. Locally via `<Blocks BlocksWrapperProps={{...}}/>` - applies only to this specific blocks instance and overrides global props
   *
   * For merging both global and local props, spread the context props before adding your own:
   * ```
   * <Blocks
   *   BlocksWrapperProps={{
   *     ...builderContext.BlocksWrapperProps,
   *     'data-test-id': 'my-test-id'
   *   }}
   * />
   * ```
   */
  BlocksWrapperProps: any;

  children?: any;

  classNameProp?: string;
};

export default function BlocksWrapper(props: BlocksWrapperProps) {
  const blocksWrapperRef = useRef<HTMLDivElement>();
  const state = useStore({
    shouldUpdate: false,
    get className() {
      return [
        'builder-blocks',
        !props.blocks?.length ? 'no-blocks' : '',
        props.classNameProp,
      ]
        .filter(Boolean)
        .join(' ');
    },
    get dataPath() {
      if (!props.path) {
        return undefined;
      }
      const thisPrefix = 'this.';
      const pathPrefix = 'component.options.';
      return props.path.startsWith(thisPrefix)
        ? props.path.replace(thisPrefix, '')
        : props.path.startsWith(pathPrefix)
          ? props.path
          : `${pathPrefix}${props.path || ''}`;
    },
    onClick() {
      if (isEditing() && !props.blocks?.length) {
        window.parent?.postMessage(
          {
            type: 'builder.clickEmptyBlocks',
            data: {
              parentElementId: props.parent,
              dataPath: state.dataPath,
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
              dataPath: state.dataPath,
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
          if (state.dataPath) {
            blocksWrapperRef.setAttribute('builder-path', state.dataPath);
          }
          if (props.parent) {
            blocksWrapperRef.setAttribute('builder-parent-id', props.parent);
          }
        }
      },
      default: () => {},
    });
  });

  onUpdate(() => {
    useTarget({
      angular: () => {
        state.shouldUpdate = true;
      },
      default: () => {},
    });
  }, [props.blocks]);

  return (
    <props.BlocksWrapper
      ref={blocksWrapperRef}
      class={state.className}
      builder-path={state.dataPath}
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
