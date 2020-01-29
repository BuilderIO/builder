import * as reactDom from 'react-dom'
import * as React from 'react'
import { BuilderComponent } from '@builder.io/react'

function ComponentLoader(props: { content: any }) {
  const [value, setValue] = React.useState(null)
  const [content, setContent] = React.useState(props.content)

  function valueChangeListner(event: MessageEvent) {
    const data = event.data
    // TODO: message for values and value change
    if (data && data.type === 'builder.updateEditorValue') {
      setValue(data.data.value)
    } else if (data && data.type === 'builder.loadContent') {
      setContent(data.data.content)
    }
  }

  React.useEffect(() => {
    addEventListener('message', valueChangeListner)
    return () => removeEventListener('message', valueChangeListner)
  }, [])

  return (
    <BuilderComponent
      content={content}
      data={{
        value
      }}
      onStateChange={state => {
        setValue(state.value)

        self.postMessage(
          {
            type: 'builder.workerEditorValueChange',
            data: {
              value: state.value
            }
          },
          '*'
        )
        // TODO: message up
      }}
    />
  )
}
let loaded = false
if (typeof self !== 'undefined') {
  self.addEventListener('message', event => {
    const data = event.data
    // TODO: message for values and value change
    if (data && data.type === 'builder.loadContent' && !loaded) {
      loaded = true
      reactDom.render(
        React.createElement(ComponentLoader, {
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
