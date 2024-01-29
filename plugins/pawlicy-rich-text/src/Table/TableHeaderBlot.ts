import { Quill } from 'react-quill'

import { CellAttributes } from './CelAttributes'
import ContainBlot from './ContainBlot'

const Container = Quill.import('blots/container')
const Block = Quill.import('blots/block')
const BlockEmbed = Quill.import('blots/block/embed')
const Parchment = Quill.import('parchment')

class TableHeader extends ContainBlot {
  static blotName = 'th'
  static tagName = 'th'
  static scope = Parchment.Scope.BLOCK_BLOT
  static defaultChild = 'block'
  static allowedChildren = [Block, BlockEmbed, Container]

  static create(value: CellAttributes) {
    // console.log('TableHead create', value)
    const tagName = 'th'
    const node = super.create(tagName)

    const rowId = value?.rowId
    const colspan = value?.colspan
    const rowspan = value?.rowspan
    const column = value?.column
    const cellClass = value?.cellClass
    const cellId = value?.cellId

    node.setAttribute('data-row-id', rowId)
    if (colspan) {
      node.setAttribute('colspan', colspan)
    }
    if (rowspan) {
      node.setAttribute('rowspan', rowspan)
    }
    if (column) {
      node.setAttribute('column', column)
    }
    if (cellClass) {
      node.classList.add(cellClass)
    }
    node.setAttribute('data-cell-id', cellId)
    return node
  }

  formats() {
    const cellAttributes: CellAttributes = {
      rowId: this.domNode.getAttribute('data-row-id'),
      colspan: this.domNode.getAttribute('colspan'),
      rowspan: this.domNode.getAttribute('rowspan'),
      column: this.domNode.getAttribute('column'),
      cellClass: this.domNode.getAttribute('class'),
      cellId: this.domNode.getAttribute('data-cell-id'),
    }
    return {
      [this.statics.blotName]: cellAttributes,
    }
  }

  optimize(context: Object) {
    super.optimize(context)

    const parent = this.parent
    if (parent != null) {
      if (parent.statics.blotName === 'th') {
        this.moveChildren(parent, this)
        this.remove()
        return
      } else if (parent.statics.blotName != 'tr') {
        // we will mark td position, put in table and replace mark
        const mark = Parchment.create('block')
        this.parent.insertBefore(mark, this.next)
        const table = Parchment.create('table', this.domNode.getAttribute('table_id'))
        const thead = Parchment.create('thead', this.domNode.getAttribute('table_id'))
        const tr = Parchment.create('tr', this.domNode.getAttribute('data-row-id'))
        table.appendChild(thead)
        thead.appendChild(tr)
        tr.appendChild(this)
        table.replace(mark)
      }
    }

    // merge same TH id
    const next = this.next
    if (
      next != null &&
      next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName &&
      next.domNode.getAttribute('data-cell-id') === this.domNode.getAttribute('data-cell-id')
    ) {
      next.moveChildren(this)
      next.remove()
    }
  }

  insertBefore(childBlot: any, refBlot: any) {
    if (
      this.statics.allowedChildren != null &&
      !this.statics.allowedChildren.some(function (child: any) {
        return childBlot instanceof child
      })
    ) {
      const newChild = Parchment.create(this.statics.defaultChild)
      newChild.appendChild(childBlot)
      childBlot = newChild
    }
    super.insertBefore(childBlot, refBlot)
  }

  replace(target: any) {
    if (target.statics.blotName !== this.statics.blotName) {
      const item = Parchment.create(this.statics.defaultChild)
      target.moveChildren(item)
      this.appendChild(item)
    }
    if (target.parent == null) return
    super.replace(target)
  }

  moveChildren(targetParent: any, refNode: any) {
    this.children.forEach(function (child: any) {
      targetParent.insertBefore(child, refNode)
    })
  }
}

export default TableHeader
