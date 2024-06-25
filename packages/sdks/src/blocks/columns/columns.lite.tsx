import {
  For,
  Show,
  useMetadata,
  useStore,
  useTarget,
} from '@builder.io/mitosis';
import Blocks from '../../components/blocks/blocks.lite.jsx';
import DynamicDiv from '../../components/dynamic-div.lite.jsx';
import DynamicRenderer from '../../components/dynamic-renderer/dynamic-renderer.lite.jsx';
import InlinedStyles from '../../components/inlined-styles.lite.jsx';
import type { SizeName } from '../../constants/device-sizes.js';
import { getSizesForBreakpoints } from '../../constants/device-sizes.js';
import { TARGET } from '../../constants/target.js';
import { deoptSignal } from '../../functions/deopt.js';
import { getClassPropName } from '../../functions/get-class-prop-name.js';
import { mapStyleObjToStrIfNeeded } from '../../functions/get-style.js';
import type { Dictionary } from '../../types/typescript.js';
import type { Column, ColumnProps } from './columns.types.js';
import { getColumnsClass } from './helpers.js';

type CSSVal = string | number;

useMetadata({
  rsc: {
    componentType: 'server',
  },
  qwik: {
    setUseStoreFirst: true,
  },
});

export default function Columns(props: ColumnProps) {
  const state = useStore({
    gutterSize: typeof props.space === 'number' ? props.space || 0 : 20,
    cols: props.columns || [],
    stackAt: props.stackColumnsAt || 'tablet',
    getTagName(column: Column) {
      return column.link
        ? props.builderLinkComponent ||
            useTarget({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              reactNative: BaseText,
              default: 'a',
            })
        : useTarget({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            reactNative: View,
            angular: DynamicDiv,
            default: 'div',
          });
    },
    getWidth(index: number) {
      return state.cols[index]?.width || 100 / state.cols.length;
    },
    getColumnCssWidth(index: number) {
      const subtractWidth =
        (state.gutterSize * (state.cols.length - 1)) / state.cols.length;
      return `calc(${state.getWidth(index)}% - ${subtractWidth}px)`;
    },

    getTabletStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }): CSSVal {
      return state.stackAt === 'tablet' ? stackedStyle : desktopStyle;
    },

    getMobileStyle({
      stackedStyle,
      desktopStyle,
    }: {
      stackedStyle: CSSVal;
      desktopStyle: CSSVal;
    }): CSSVal {
      return state.stackAt === 'never' ? desktopStyle : stackedStyle;
    },

    flexDir:
      props.stackColumnsAt === 'never'
        ? 'row'
        : props.reverseColumnsWhenStacked
          ? 'column-reverse'
          : 'column',

    columnsCssVars(): Dictionary<string> {
      return useTarget({
        reactNative: {
          flexDirection: state.flexDir as 'row' | 'column' | 'column-reverse',
        },
        default: {
          '--flex-dir': state.flexDir,
          '--flex-dir-tablet': state.getTabletStyle({
            stackedStyle: state.flexDir,
            desktopStyle: 'row',
          }),
        } as Dictionary<string>,
      });
    },

    columnCssVars(index: number): Dictionary<string> {
      const gutter = index === 0 ? 0 : state.gutterSize;

      const width = state.getColumnCssWidth(index);
      const gutterPixels = `${gutter}px`;
      const mobileWidth = '100%';
      const mobileMarginLeft = 0;

      const marginLeftKey = useTarget({
        react: 'marginLeft',
        rsc: 'marginLeft',
        default: 'margin-left',
      });

      const sharedStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      };

      return useTarget({
        reactNative: {
          ...sharedStyles,
          marginLeft: props.stackColumnsAt === 'never' ? gutter : 0,
        } as any as Dictionary<string>,
        default: {
          ...sharedStyles,
          width,
          [marginLeftKey]: gutterPixels,
          '--column-width-mobile': state.getMobileStyle({
            stackedStyle: mobileWidth,
            desktopStyle: width,
          }),
          '--column-margin-left-mobile': state.getMobileStyle({
            stackedStyle: mobileMarginLeft,
            desktopStyle: gutterPixels,
          }),
          '--column-width-tablet': state.getTabletStyle({
            stackedStyle: mobileWidth,
            desktopStyle: width,
          }),
          '--column-margin-left-tablet': state.getTabletStyle({
            stackedStyle: mobileMarginLeft,
            desktopStyle: gutterPixels,
          }),
        } as Dictionary<string>,
      });
    },

    getWidthForBreakpointSize(size: SizeName) {
      const breakpointSizes = getSizesForBreakpoints(
        props.builderContext.value.content?.meta?.breakpoints || {}
      );

      return breakpointSizes[size].max;
    },

    columnsStyles(): string {
      return `
        @media (max-width: ${state.getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${state.getWidthForBreakpointSize('small')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-mobile) !important;
            margin-left: var(--column-margin-left-mobile) !important;
          }
        },
      `;
    },

    getAttributes(column: any, index: number) {
      return {
        ...useTarget({
          reactNative: {
            dataSet: { 'builder-block-name': 'builder-column' },
          },
          default: {},
        }),
        ...(column.link ? { href: column.link } : {}),
        [getClassPropName()]: 'builder-column',
        style: mapStyleObjToStrIfNeeded(state.columnCssVars(index)),
      };
    },
  });

  return (
    <div
      class={getColumnsClass(props.builderBlock?.id)}
      css={{
        display: 'flex',
        lineHeight: 'normal',
      }}
      style={state.columnsCssVars()}
      {...useTarget({
        reactNative: {
          dataSet: { 'builder-block-name': 'builder-columns' },
        },
        default: {},
      })}
    >
      <Show when={TARGET !== 'reactNative'}>
        {/**
         * Need to use style tag for column and columns style instead of using the
         * respective 'style' or 'css' attributes because the rules now contain
         * "dynamic" media query values based on custom breakpoints.
         * Adding them directly otherwise leads to Mitosis and TS errors.
         */}
        <InlinedStyles styles={state.columnsStyles()} id="builderio-columns" />
      </Show>

      <For each={props.columns}>
        {(column, index) => (
          <DynamicRenderer
            key={index}
            TagName={state.getTagName(column)}
            actionAttributes={{}}
            attributes={state.getAttributes(column, index)}
          >
            <Blocks
              blocks={useTarget({
                /**
                 * Workaround until https://github.com/BuilderIO/qwik/issues/5017 is fixed.
                 */
                qwik: deoptSignal(column.blocks),
                default: column.blocks,
              })}
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{
                flexGrow: useTarget<string | number>({
                  reactNative: 1,
                  default: '1',
                }),
              }}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          </DynamicRenderer>
        )}
      </For>
    </div>
  );
}
