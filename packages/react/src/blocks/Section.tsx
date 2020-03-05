/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { BuilderElement } from '@builder.io/sdk'
import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component'
import { withBuilder } from '../functions/with-builder'

interface SectionProps {
  builderBlock?: BuilderElement
  verticalAlignContent?: string
  maxWidth?: number
}

class SectionComponent extends React.Component<SectionProps> {
  render() {
    return (
      <div
        css={{
          width: '100%',
          // height: '100%' was is here so the inner contents can align center, but that is causing 
          // issues in Safari. Need another workaround.
          alignSelf: 'stretch',
          flexGrow: 1,
          boxSizing: 'border-box',
          maxWidth: this.props.maxWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {/* TODO: maybe builder <BuilderBlocks? */}
        {this.props.builderBlock &&
          this.props.builderBlock.children &&
          this.props.builderBlock.children.map((block, index) => (
            <BuilderBlockComponent key={block.id} block={block} />
          ))}
        {/* <BuilderBlocks blocks={this.builderBlock.children} dataPath="children" emailMode /> */}
      </div>
    )
  }
}

export const Section = withBuilder(SectionComponent, {
  name: 'Core:Section',
  static: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2F682efef23ace49afac61748dd305c70a',
  inputs: [
    {
      name: 'maxWidth',
      type: 'number',
      defaultValue: 1200
    }
  ],
  defaultStyles: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '50px',
    paddingBottom: '50px',
    marginTop: '0px',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)'
  },
  canHaveChildren: true,

  // TODO: defaults that deep merge and can be anyting - responsive styles, etc
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'center'
        }
      },
      component: {
        name: 'Text',
        options: {
          text:
            "<p><b>I am a section! My content keeps from getting too wide, so that it's easy to read even on big screens.</b></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>"
        }
      }
    }
  ]
  // TODO
  // defaultChildren: ..

  // Share these hooks across the projects
  // hooks: {
  //   'BlocksOverlay::debounceNextTickUpdateStyles#updateStyles': () => convert margin selectors to paddings of table
  //   '@builder.io/app:Style.foo': () => { /* ... */ } // maybe optionally async
  // }
})
