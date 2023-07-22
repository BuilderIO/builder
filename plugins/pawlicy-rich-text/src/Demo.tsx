import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { BuilderIOEditor } from '../src'

const App = () => {
  const [value, setValue] = useState('')
  return (
    <div>
      <h1>Rich Text Editor</h1>
      <BuilderIOEditor
        value={value}
        onChange={value => {
          setValue(value)
        }}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
