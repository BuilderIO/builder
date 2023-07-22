import * as QuillType from 'quill'
import Delta from 'quill-delta'
import { Quill } from 'react-quill'

import { applyFormat } from '../utils/applyFormat'
import { StyledList, StyledListItem } from './ListBlot'
import { ListStyle } from './ListStyle'
import { listToolbar } from './listToolbar'

class ListModule {
  type = 'circle'
  spacing = 'none'
  quill: QuillType.Quill | undefined = undefined

  static register() {
    Quill.register(StyledList)
    Quill.register(StyledListItem)
    Quill.register(ListStyle)
  }

  constructor(quill: QuillType.Quill, options: {}) {
    this.quill = quill
    const toolbar = quill.getModule('toolbar')
    const clipboard = quill.getModule('clipboard')
    toolbar.addHandler('list-type', (value: string) => {
      this.type = value
      return this.listHandler(`${this.type}-${this.spacing}`)
    })
    toolbar.addHandler('list-spacing', (value: string) => {
      this.spacing = value
      return this.listHandler(`${this.type}-${this.spacing}`)
    })
    clipboard.addMatcher('ul', function (node: HTMLElement, delta: Delta) {
      const className = node.getAttribute('class')
      if (className && className.includes('list-style')) {
        const newDelta = applyFormat(delta, 'liststyle', className.replace('list-style-', ''))
        return newDelta
      }
      return delta
    })
    clipboard.addMatcher('li', function (node: HTMLElement, delta: Delta) {
      return delta
    })
  }

  isBlotUL(blot: any) {
    return (
      (Array.isArray(blot.statics.tagName) && blot.statics.tagName.includes('UL')) ||
      blot.statics.tagName === 'UL'
    )
  }

  getList() {
    if (this.quill === undefined) return null
    const range = this.quill.getSelection() || {
      index: 0,
      length: 0,
    }
    const leaf = this.quill.getLeaf(range['index'])
    let blot = leaf[0]

    while (blot != null && this.isBlotUL(blot) === false) {
      blot = blot.parent
    }

    return blot
  }

  listHandler(value: string) {
    if (this.quill === undefined) return
    const list = this.getList()
    // only apply liststyle to list
    if (list === null) return
    const index = list.offset(this.quill.scroll)

    this.quill.setSelection(index, list.length())
    this.quill.format('liststyle', value, 'user')
    return
  }
}

export { ListModule, ListStyle, listToolbar, StyledList, StyledListItem }
