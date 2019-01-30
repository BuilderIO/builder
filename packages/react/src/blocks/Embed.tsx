import React from 'react'
import { BuilderBlock } from '../decorators/builder-block.decorator'

@BuilderBlock({
  name: 'Embed',
  inputs: [
    {
      name: 'url',
      type: 'url',
      required: true,
      defaultValue: '',
      helperText: 'e.g. enter a youtube url, google map, etc',
      onChange(options: Map<string, any>) {
        const url = options.get('url')
        if (url) {
          // TODO: get this out of here!
          const apiKey = 'ae0e60e78201a3f2b0de4b'
          return fetch(`https://iframe.ly/api/iframely?url=${url}&api_key=${apiKey}`)
            .then(res => res.json())
            .then(data => {
              if (data.html && options.get('url') === url) {
                options.set('content', data.html)
              }
            })
        } else {
          options.delete('content')
        }
      }
    },
    {
      name: 'content',
      type: 'html',
      defaultValue: `<div style="padding: 20px; text-align: center">(Choose an embed URL)<div>`,
      hideFromUI: true
    }
  ]
})
export class Embed extends React.Component<any> {
  render() {
    return (
      <div className="builder-embed" dangerouslySetInnerHTML={{ __html: this.props.content }} />
    )
  }
}
