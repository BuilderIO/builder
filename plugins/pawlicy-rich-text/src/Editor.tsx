/* eslint-disable @typescript-eslint/no-empty-function */
import 'react-quill/dist/quill.snow.css'
import './PawlicyIcons/icon.css'
import './PawlicyIcons/fonts/PawlicyFont.css'
import './quill.css'
import './ListModule/list.css'

import styled from '@emotion/styled'
import Delta from 'quill-delta'
import React, { useEffect } from 'react'
import MonacoEditor from 'react-monaco-editor'
import ReactQuill, { Quill } from 'react-quill'

import { Id, Width } from './Attributes'
import { LinkType, ScriptStyleType, Size } from './Formats'
import { StyleTagBlot } from './Formats/StyleTag'
import { ImageDrop } from './ImageDrop'
import { ImageResize } from './ImageResize'
import { ApplicationContext } from './interfaces/application-context'
import { ListModule, listToolbar } from './ListModule'
import { PawlicyBlot, PawlicyToolbar } from './PawlicyIcons'
import { TableModule } from './Table'
import TableResize from './Table/TableResize/TableResize'

Quill.register({ 'formats/pawlicyicon': PawlicyBlot })
Quill.register({ 'modules/pawlicyicons-toolbar': PawlicyToolbar })
Quill.register({ 'formats/id': Id })
Quill.register({ 'formats/width': Width })
Quill.register(StyleTagBlot)
Quill.register(Quill.import('attributors/style/align'))
Quill.register(LinkType)
Quill.register(ScriptStyleType)
Quill.register(Size)
Quill.register({ 'modules/imageResize': ImageResize })
Quill.register({ 'modules/imageDrop': ImageDrop })
Quill.register({ 'modules/table': TableModule })
Quill.register({ 'modules/tableResize': TableResize })
Quill.register('modules/listModule', ListModule)

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
      ['pawlicyicons'],
      [...listToolbar],
    ],
    handlers: {
      pawlicyicons: function () {},
      'list-type': () => {},
      'list-spacing': () => {},
    },
  },
  'pawlicyicons-toolbar': true,
  imageResize: {},
  imageDrop: true,
  table: true,
  listModule: true,
  tableResize: {},
  // clipboard: {
  //   matchVisual: !1,
  //   matchSpacing: !1,
  // },
  clipboard: {
    matchers: [
      [
        'style',
        function (node: HTMLElement, delta: Delta) {
          const newDelta = new Delta()
            .insert((node.textContent || '').replace(/(\n)/gm, ''), { styletag: true })
            .insert('\n')
          return newDelta
        },
      ],
    ],
  },
}

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
  'background',
  'align',
  'direction',
  'code-block',
  'script',
  'id',
  'width',
  'pawlicyicon',
  'intent',
  'styletag',
  'table',
  'tbody',
  'thead',
  'tr',
  'td',
  'th',
  'liststyle',
]

const Container = styled.div`
  display: flex;
  flex-direction: column;
  -webkit-box-align: stretch;
  align-items: stretch;
`

type Mode = 'normal' | 'dialog'

type Editor = 'quill' | 'monaco'

interface TextProps {
  value: string
  onChange: (newValue: string, mode: Mode, editor: Editor) => void
  context?: ApplicationContext
  editor: Editor
  mode: Mode
  changeFocus: (mode: Mode) => void
}

function RichTextEditor(props: TextProps) {
  const { editor, changeFocus, mode } = props

  const forwardChange = (value: string) => {
    props.onChange(value, mode, editor)
  }

  const setFocus = () => {
    changeFocus(mode)
  }

  return (
    <Container onFocus={setFocus}>
      {editor === 'quill' ? (
        <ReactQuill
          theme="snow"
          value={props.value}
          onChange={forwardChange}
          modules={modules}
          formats={formats}
        />
      ) : (
        <div style={{ height: 300, minHeight: '100%' }}>
          <MonacoEditor
            value={props.value}
            language="html"
            onChange={forwardChange}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'off',
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
              folding: !1,
              automaticLayout: !0,
              renderLineHighlight: 'none',
              scrollbar: {
                horizontal: 'hidden',
                vertical: 'hidden',
              },
            }}
          />
        </div>
      )}
    </Container>
  )
}

export { RichTextEditor }
