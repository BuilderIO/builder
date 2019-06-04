import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'
import { Builder, builder, BuilderElement } from '@builder.io/sdk'
const iconUrl =
  'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-text_fields-24px%20(1).svg?alt=media&token=12177b73-0ee3-42ca-98c6-0dd003de1929'

export interface TextProps {
  text: string
  builderBlock?: BuilderElement
}

@BuilderBlock({
  name: 'Text',
  image: iconUrl,
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      defaultValue: 'Enter some text...'
    }
  ],
  // Maybe optionally a function that takes in some params like block vs absolute, etc
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center'
  }
})
export class Text extends React.Component<TextProps> {
  textRef: HTMLSpanElement | null = null

  componentDidUpdate(prevProps: TextProps) {
    if (!this.allowTextEdit) {
      return
    }
    if (
      this.textRef &&
      !(this.textRef.contentEditable === 'true' && this.textRef === document.activeElement)
    ) {
      if (this.props.text !== prevProps.text) {
        this.textRef.innerHTML = this.props.text
      }
    }
  }

  componentDidMount() {
    if (this.textRef) {
      this.textRef.innerHTML = this.props.text
    }
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
    )
  }

  render() {
    const allowEditingText = this.allowTextEdit
    return (
      <React.Fragment>
        <style>{`.builder-text p:first-child, .builder-paragraph:first-child { margin: 0 } .builder-text > p, .builder-paragraph { color: inherit; line-height: inherit; letter-spacing: inherit; font-weight: inherit; font-size: inherit; text-align: inherit; font-family: inherit; }`}</style>
        {/* TODO: <BuilderEditableText component that wraps this for other components with text */}
        <span
          ref={ref => {
            this.textRef = ref
          }}
          contentEditable={allowEditingText}
          onInput={e => {
            if (allowEditingText) {
              window.parent.postMessage(
                {
                  type: 'builder.textEdited',
                  data: {
                    id: this.props.builderBlock && this.props.builderBlock.id,
                    value: e.currentTarget.innerHTML
                  }
                },
                '*'
              )
            }
          }}
          onKeyDown={e => {
            if (
              allowEditingText &&
              this.textRef &&
              e.which === 27 &&
              document.activeElement === this.textRef
            ) {
              this.textRef.blur()
            }
          }}
          onFocus={e => {
            if (allowEditingText) {
              window.parent.postMessage(
                {
                  type: 'builder.textFocused',
                  data: {
                    id: this.props.builderBlock && this.props.builderBlock.id
                  }
                },
                '*'
              )
            }
          }}
          onBlur={e => {
            if (allowEditingText) {
              window.parent.postMessage(
                {
                  type: 'builder.textBlurred',
                  data: {
                    id: this.props.builderBlock && this.props.builderBlock.id
                  }
                },
                '*'
              )
            }
          }}
          style={{ outline: 'none' }}
          className="builder-text"
          {...!allowEditingText && {
            dangerouslySetInnerHTML: {
              __html: this.props.text || (this.props as any).content || ''
            }
          }}
        />
      </React.Fragment>
    )
  }
}
