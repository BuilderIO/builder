/** @jsx jsx */
import { jsx, InterpolationWithTheme } from '@emotion/core';
import React from 'react';
import { Builder, BuilderElement } from '@builder.io/sdk';
import { withBuilder } from '../functions/with-builder';
import { BuilderStoreContext } from '../store/builder-store';
import { tryEval } from '../functions/try-eval';

const iconUrl =
  'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929';

export interface TextProps {
  text: string;
  builderBlock?: BuilderElement;
}

class TextComponent extends React.Component<TextProps> {
  textRef: HTMLSpanElement | null = null;

  componentDidMount() {
    // test if there are any expressions in text before assigning innerHTML
    if (this.textRef && !/{{([^}]+)}}/.test(this.props.text)) {
      this.textRef.innerHTML = this.props.text;
    }
  }

  evalExpression(expression: string, state: any) {
    // Don't interpolate when inline editing
    if (this.allowTextEdit) {
      return String(expression);
    }
    return String(expression).replace(/{{([^}]+)}}/g, (match, group) => tryEval(group, state));
  }

  get allowTextEdit() {
    return (
      Builder.isBrowser &&
      Builder.isEditing &&
      location.search.includes('builder.allowTextEdit=true') &&
      !(
        this.props.builderBlock &&
        this.props.builderBlock.bindings &&
        (this.props.builderBlock.bindings['component.options.text'] ||
          this.props.builderBlock.bindings['options.text'] ||
          this.props.builderBlock.bindings['text'])
      )
    );
  }

  render() {
    const textCSS: InterpolationWithTheme<any> = {
      outline: 'none',
      '& p:first-of-type, & .builder-paragraph:first-of-type': {
        margin: 0,
      },
      '& > p, & .builder-paragraph': {
        color: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        fontWeight: 'inherit',
        fontSize: 'inherit',
        textAlign: 'inherit',
        fontFamily: 'inherit',
      },
    };

    return (
      <BuilderStoreContext.Consumer>
        {state => {
          if (state.content.meta?.rtlMode) {
            textCSS.direction = 'rtl';
          }

          return (
            <React.Fragment>
              {/* TODO: <BuilderEditableText component that wraps this for other components with text */}
              <span
                ref={ref => {
                  this.textRef = ref;
                }}
                css={textCSS}
                className={
                  /* NOTE: This class name must be "builder-text" for inline editing to work in the Builder editor */
                  'builder-text'
                }
                {...{
                  dangerouslySetInnerHTML: {
                    __html: this.evalExpression(
                      this.props.text || (this.props as any).content || '',
                      state.state
                    ),
                  },
                }}
              />
            </React.Fragment>
          );
        }}
      </BuilderStoreContext.Consumer>
    );
  }
}

export const Text = withBuilder(TextComponent, {
  name: 'Text',
  static: true,
  image: iconUrl,
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      autoFocus: true,
      bubble: true,
      defaultValue: 'Enter some text...',
    },
  ],
  // Maybe optionally a function that takes in some params like block vs absolute, etc
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center',
  },
});
