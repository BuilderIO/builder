import React from 'react';
import { BuilderBlock } from '../decorators/builder-block.decorator';
import { Builder, builder, BuilderElement } from '@builder.io/sdk';
import HTML from 'react-native-render-html'
const iconUrl =
  'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929';

export interface TextProps {
  text: string;
  builderBlock?: BuilderElement;
}

@BuilderBlock({
  name: 'Text',
  image: iconUrl,
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      defaultValue: 'Enter some text...',
    },
  ],
  // Maybe optionally a function that takes in some params like block vs absolute, etc
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center',
  },
})
export class Text extends React.Component<TextProps> {
  render() {
    return (
      <React.Fragment>
        {/* TODO: handle this */}
        {/* <style>{`.builder-text p:first-child, .builder-paragraph:first-child { margin: 0 } .builder-text > p, .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }`}</style> */}
        <HTML html={this.props.text || ' '} />
      </React.Fragment>
    );
  }
}
