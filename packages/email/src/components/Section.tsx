import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';
import { Block } from './Block';

interface SectionProps {
  builderBlock?: any;
  attributes?: any;
  children?: any[]; // Ideally accept react nodes too
  verticalAlignContent?: string;
  maxWidth?: number;
}

// TODO: acceptsChildren option?
@BuilderBlock({
  name: 'Email:Section',
  inputs: [
    {
      name: 'children',
      type: 'uiBlocks',
      defaultValue: [
        {
          '@type': '@builder.io/sdk:Element',
          responsiveStyles: {
            large: {
              // marginTop: '20px',
              textAlign: 'center',
            },
          },
          component: {
            name: 'Email:Text',
            options: {
              text:
                "<span>I am a section! My content keeps from getting too wide, so that it's easy to read even on big screens. Lorem ipsum dolor kismet etc etc :)</span>",
            },
          },
        },
      ],
      // showNoBlocks: false
      hideFromUI: true,
    },
    {
      name: 'maxWidth',
      type: 'number',
      defaultValue: 800,
    },
    {
      name: 'verticalAlignContent',
      type: 'string',
      enum: ['top', 'bottom', 'middle'],
      defaultValue: 'top',
    },
  ],
  defaultStyles: {
    // height: '200px',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '50px',
    paddingBottom: '50px',
    marginTop: '0px',
  },
  // acceptChildren: 'children'
  // Share these hooks across the projects
  // hooks: {
  //   'BlocksOverlay::debounceNextTickUpdateStyles#updateStyles': () => convert margin selectors to paddings of table
  //   '@builder.io/app:Style.foo': () => { /* ... */ } // maybe optionally async
  // }
})
export class Section extends React.Component<SectionProps> {
  render() {
    return (
      <Block
        attributes={this.props.attributes}
        builderBlock={this.props.builderBlock}
        innerStyleOverrides={{ verticalAlign: this.props.verticalAlignContent }}
      >
        {/* Better way to do this? */}
        <table
          cellPadding="0"
          cellSpacing="0"
          {...{
            width: '100%',
            border: '0',
          }}
        >
          <tbody>
            <tr>
              <td />
              <td {...{ align: 'center', width: this.props.maxWidth }} style={{ maxWidth: '100%' }}>
                {/* <table
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    // width: this.props.maxWidth,
                    // maxWidth: '100%',
                    width: '100%',
                    maxWidth: this.props.maxWidth || undefined
                  }}
                  {...{
                    width: '100%',
                    border: '0'
                  }}
                >
                  <tbody>
                    <tr>
                      <td> */}
                {/* Wrapper for Safari */}
                {/* Or should be inline-block with width: 100%? */}
                <div style={{ margin: 'auto', maxWidth: this.props.maxWidth }}>
                  <BuilderBlocks blocks={this.props.children} dataPath="children" emailMode />
                </div>
                {/* </td>
                    </tr>
                  </tbody>
                </table> */}
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </Block>
    );
  }
}
