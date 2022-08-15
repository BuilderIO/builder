/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { BuilderBlocks } from '../../components/builder-blocks.component';
import { Link } from '../../components/Link';


export class ColumnsComponent extends React.Component<any> {
  // TODO: Column interface
  get columns(): any[] {
    return this.props.columns || [];
  }

  get gutterSize(): number {
    return typeof this.props.space === 'number' ? this.props.space || 0 : 20;
  }

  getWidth(index: number) {
    return (this.columns[index] && this.columns[index].width) || 100 / this.columns.length;
  }

  getColumnWidth(index: number) {
    const { columns, gutterSize } = this;
    const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
    return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
  }

  render() {
    const { columns, gutterSize } = this;

    return (
      // FIXME: make more elegant
      <React.Fragment>
        <div
          className="builder-columns"
          css={{
            display: 'flex',
            ...(this.props.stackColumnsAt !== 'never' && {
              [`@media (max-width: ${this.props.stackColumnsAt !== 'tablet' ? 639 : 991}px)`]: {
                flexDirection: this.props.reverseColumnsWhenStacked ? 'column-reverse' : 'column',
                alignItems: 'stretch',
              },
            }),
          }}
        >
          {columns.map((col, index) => {
            const TagName = col.link ? Link : 'div';

            // TODO: pass size down in context

            return (
              <React.Fragment key={index}>
                <TagName
                  className="builder-column"
                  {...(col.link ? { href: col.link } : null)}
                  // TODO: generate width and margin-left as CSS instead so can override with pure CSS for best responsieness
                  // and no use of !important
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    lineHeight: 'normal',
                    ['& > .builder-blocks']: {
                      flexGrow: 1,
                    },
                    width: this.getColumnWidth(index),
                    marginLeft: index === 0 ? 0 : gutterSize,
                    ...(this.props.stackColumnsAt !== 'never' && {
                      [`@media (max-width: ${
                        this.props.stackColumnsAt !== 'tablet' ? 639 : 991
                      }px)`]: {
                        width: '100%',
                        marginLeft: 0,
                      },
                    }),
                  }}
                >
                  <BuilderBlocks
                    key={index}
                    // TODO: childOf [parentBlocks]?
                    child
                    parentElementId={this.props.builderBlock && this.props.builderBlock.id}
                    blocks={col.blocks}
                    dataPath={`component.options.columns.${index}.blocks`}
                  />
                </TagName>
              </React.Fragment>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

