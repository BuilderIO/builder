import * as React from 'react';

type Column = {
  blocks: BuilderBlock[];
  width?: number;
};
type CSSVal = string | number;
type StackColumnsAt = 'tablet' | 'mobile' | 'never';
export interface ColumnProps {
  columns?: Column[];
  space?: number;
  stackColumnsAt?: StackColumnsAt;
  reverseColumnsWhenStacked?: boolean;
  builderComponents: Dictionary<RegisteredComponent>;
}

import RenderBlocks from '../../components/render-blocks';
import type { BuilderBlock } from '../../types/builder-block';
import { getSizesForBreakpoints } from '../../constants/device-sizes';
import type { SizeName } from '../../constants/device-sizes';
import RenderInlinedStyles from '../../components/render-inlined-styles';
import { TARGET } from '../../constants/target';
import type { Dictionary } from '../../types/typescript';
import type { RegisteredComponent } from '@/sdk-src/context/types';

import type { PropsWithBuilder } from '@/sdk-src/types/builder-props';

function Columns(props: PropsWithBuilder<ColumnProps>) {
  const gutterSize = typeof props.space === 'number' ? props.space || 0 : 20;

  const cols = props.columns || [];

  const stackAt = props.stackColumnsAt || 'tablet';

  function getWidth(index: number) {
    return cols[index]?.width || 100 / cols.length;
  }

  function getColumnCssWidth(index: number) {
    const subtractWidth = (gutterSize * (cols.length - 1)) / cols.length;
    return `calc(${getWidth(index)}% - ${subtractWidth}px)`;
  }

  function getTabletStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt === 'tablet' ? stackedStyle : desktopStyle;
  }

  function getMobileStyle({
    stackedStyle,
    desktopStyle,
  }: {
    stackedStyle: CSSVal;
    desktopStyle: CSSVal;
  }) {
    return stackAt === 'never' ? desktopStyle : stackedStyle;
  }

  const flexDir =
    props.stackColumnsAt === 'never'
      ? 'row'
      : props.reverseColumnsWhenStacked
      ? 'column-reverse'
      : 'column';

  function columnsCssVars() {
    if (TARGET === 'reactNative') {
      return {
        flexDirection: flexDir,
      } as Dictionary<string>;
    }
    return {
      '--flex-dir': flexDir,
      '--flex-dir-tablet': getTabletStyle({
        stackedStyle: flexDir,
        desktopStyle: 'row',
      }),
    } as Dictionary<string>;
  }

  function columnCssVars(index: number) {
    const gutter = index === 0 ? 0 : gutterSize;
    if (TARGET === 'reactNative') {
      return {
        marginLeft: props.stackColumnsAt === 'never' ? gutter : 0,
      } as any as Dictionary<string>;
    }
    const width = getColumnCssWidth(index);
    const gutterPixels = `${gutter}px`;
    const mobileWidth = '100%';
    const mobileMarginLeft = 0;
    return {
      width,
      [TARGET === 'react' ? 'marginLeft': 'margin-left']: gutterPixels,
      '--column-width-mobile': getMobileStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-mobile': getMobileStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
      '--column-width-tablet': getTabletStyle({
        stackedStyle: mobileWidth,
        desktopStyle: width,
      }),
      '--column-margin-left-tablet': getTabletStyle({
        stackedStyle: mobileMarginLeft,
        desktopStyle: gutterPixels,
      }),
    } as any as Dictionary<string>;
  }

  function getWidthForBreakpointSize(size: SizeName) {
    const breakpointSizes = getSizesForBreakpoints(
      props.builderContext.content?.meta?.breakpoints || {}
    );
    return breakpointSizes[size].max;
  }

  function columnsStyles() {
    return `
        @media (max-width: ${getWidthForBreakpointSize('medium')}px) {
          .${props.builderBlock.id}-breakpoints {
            flex-direction: var(--flex-dir-tablet);
            align-items: stretch;
          }

          .${props.builderBlock.id}-breakpoints > .builder-column {
            width: var(--column-width-tablet) !important;
            margin-left: var(--column-margin-left-tablet) !important;
          }
        }

        @media (max-width: ${getWidthForBreakpointSize('small')}px) {
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
  }

  return (
    <>
      <div
        className={
          `builder-columns ${props.builderBlock.id}-breakpoints` +
          ' div-fa2ab8fc'
        }
        style={columnsCssVars()}
      >
        {TARGET !== 'reactNative' ? (
          <>
            <RenderInlinedStyles styles={columnsStyles()} />
          </>
        ) : null}

        {props.columns?.map((column, index) => (
          <div
            className="builder-column div-fa2ab8fc-2"
            style={columnCssVars(index)}
            key={index}
          >
            <RenderBlocks
              blocks={column.blocks}
              path={`component.options.columns.${index}.blocks`}
              parent={props.builderBlock.id}
              styleProp={{
                flexGrow: '1',
              }}
              context={props.builderContext}
              components={props.builderComponents}
            />
          </div>
        ))}
      </div>

      <style>{`.div-fa2ab8fc {
  display: flex;
  line-height: normal;
}.div-fa2ab8fc-2 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}`}</style>
    </>
  );
}

export default Columns;
