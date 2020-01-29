import * as reactDom from 'react-dom'
import * as React from 'react'
import { BuilderComponent } from '@builder.io/react'

if (typeof self !== 'undefined') {
  self.addEventListener('message', event => {
    const data = event.data
    // TODO: message for values and value change
    if (data && data.type === 'builder.loadContent') {
      reactDom.render(
        React.createElement(BuilderComponent, {
          content: data.data.content
          // Send value down and up
        }),
        document.body
      )
    }
  })
  self.postMessage(
    {
      type: 'builder.workerLoaded',
      data: {
        type: 'content'
      }
    },
    '*'
  )
}
