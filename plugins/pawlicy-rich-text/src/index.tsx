import { Builder } from '@builder.io/react'
import styled from '@emotion/styled'
import { Dialog } from '@material-ui/core'
import parserBabel from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import React, { useEffect, useState } from 'react'

import { RichTextEditor } from './Editor'
import { ApplicationContext } from './interfaces/application-context'

interface Field {
  name: string
  required?: boolean
  type: string
  defaultValue?: string
  code?: boolean
}

interface TextProps {
  value: string
  onChange: (value: string) => void
  context?: ApplicationContext
  field?: Field
  object?: any
}

type Editor = 'quill' | 'monaco'

const IconToolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
`

const Icon = styled.button`
  color: rgb(85, 85, 85);
  flex: 0 0 auto;
  color: rgba(0, 0, 0, 0.54);
  padding: 12px;
  overflow: visible;
  font-size: 1.5rem;
  text-align: center;
  transition: none;
  border-radius: 50%;
  border: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  outline: none;
  position: relative;
  align-items: center;
  appearance: none;
  background-color: transparent;
  text-decoration: none;

  & > span {
    width: 100%;
    display: flex;
    align-items: inherit;
    justify-content: inherit;

    & > svg {
      font-size: 18px;
      fill: currentColor;
      width: 1em;
      height: 1em;
      display: inline-block;
      transition: none;
      user-select: none;
      flex-shrink: 0;
    }
  }
`

const DialogContainer = styled.div`
  padding: 21px;
  background: var(--off-background);
  height: 80vh;
  width: 80vw;
  & .quill-container {
    max-height: 100%;
  }
  & .quill {
    height: calc(100% - 42px);
  }
`

type Mode = 'normal' | 'dialog'

const format = (value: string) => {
  try {
    const prettierValue = prettier.format(value, {
      parser: 'html',
      plugins: [parserBabel],
      htmlWhitespaceSensitivity: 'ignore',
    })
    return prettierValue
  } catch (error) {
    // console.log('Prettier Error: ', error)
    return value
  }
}

const formatOnceConstructor = () => {
  let previousName: string | undefined
  return function (value: string, name: string) {
    if (previousName !== name) {
      previousName = name
      return format(value)
    }
    return value
  }
}

const formatOnce = formatOnceConstructor()

function BuilderIOEditor(props: TextProps) {
  const { onChange, field } = props
  const isCodeComponent = field?.code || false

  const [editor, setEditor] = useState<Editor>(isCodeComponent ? 'monaco' : 'quill')
  const [fullScreen, setFullScreen] = useState<boolean>(false)
  const [curentFocus, setCurrentFocus] = useState<Mode>('normal')
  const [localValue, setLocalValue] = useState<string>(props.value)

  useEffect(() => {
    // reset the formatOnce state
    formatOnce('', '')
  }, [])

  // TODO: Find a better solution
  // Problem: When switching between text components in builder.io, the editor is not re-created,
  // instead it is re-used and the props change, and monaco is not updating its local state
  // to use the new change handler
  // Temporary Solution: Use a local variable to edit locally and sync with builder.io on change
  useEffect(() => {
    if (editor === 'monaco') {
      setLocalValue(
        typeof formatOnce === 'function'
          ? formatOnce(props.value, props.object?.name || '')
          : props.value,
      )
    } else {
      setLocalValue(props.value)
    }
  }, [props.value])

  useEffect(() => {
    onChange(localValue)
  }, [localValue])

  const openDialog = () => {
    setFullScreen(true)
  }

  const closeDialog = () => {
    setFullScreen(false)
  }

  const toggleEditor = () => {
    if (editor === 'quill') {
      setEditor('monaco')
      setLocalValue(format(props.value))
    } else {
      setEditor('quill')
    }
  }

  const throttledTriggerChange = (newValue: string, mode: Mode, editor: Editor) => {
    if (mode === curentFocus || editor === 'monaco') {
      triggerChange(newValue)
    }
  }

  const triggerChange = (newValue: string) => {
    setLocalValue(newValue)
  }

  const changeFocus = (mode: Mode) => {
    setCurrentFocus(mode)
  }

  const getEditor = (mode: Mode) => {
    return (
      <RichTextEditor
        {...props}
        value={localValue}
        editor={editor}
        onChange={throttledTriggerChange}
        mode={mode}
        changeFocus={changeFocus}
      />
    )
  }

  return (
    <div>
      <div>
        <IconToolbar>
          {!isCodeComponent ? (
            <Icon onClick={toggleEditor}>
              <span>
                <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                  <g>
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
                  </g>
                </svg>
              </span>
            </Icon>
          ) : null}
          <Icon onClick={openDialog}>
            <span>
              <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                <g>
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>
                </g>
              </svg>
            </span>
          </Icon>
        </IconToolbar>
      </div>
      {getEditor('normal')}
      <Dialog open={fullScreen} maxWidth={false}>
        <DialogContainer>
          <IconToolbar>
            {!isCodeComponent ? (
              <Icon onClick={toggleEditor}>
                <span>
                  <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                    <g>
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
                    </g>
                  </svg>
                </span>
              </Icon>
            ) : null}
            <Icon onClick={closeDialog}>
              <span>
                <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                  <g>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </g>
                </svg>
              </span>
            </Icon>
          </IconToolbar>
          {getEditor('dialog')}
        </DialogContainer>
      </Dialog>
    </div>
  )
}

Builder.registerEditor({
  name: 'html',
  component: BuilderIOEditor,
})

export { BuilderIOEditor }
