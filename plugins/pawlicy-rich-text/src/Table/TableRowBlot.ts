import { Quill } from 'react-quill'

import ContainBlot from './ContainBlot'
import TableCell from './TableCellBlot'
import TableHeader from './TableHeaderBlot'
import TableTrick from './TableTrick'

const Container = Quill.import('blots/container')
const Parchment = Quill.import('parchment')
const Block = Quill.import('blots/block')

class TableRow extends ContainBlot {
  static blotName = 'tr'
  static tagName = 'tr'
  static scope = Parchment.Scope.BLOCK_BLOT
  static defaultChild = 'th'
  static allowedChildren = [TableCell, TableHeader]
  static create(value: string) {
    const tagName = 'tr'
    const node = super.create(tagName)
    node.setAttribute('data-row-id', value ? value : TableTrick.random_id())
    return node
  }

  format() {
    this.getAttribute('data-row-id')
  }

  optimize(context: Object) {
    // console.log('tr optimization', this, this.parent.statics.blotName, this.children.length)
    if (this.children.length === 0) {
      if (this.statics.defaultChild != null) {
        const child = this.createDefaultChild()
        this.appendChild(child)
        child.optimize(context)
      } else {
        this.remove()
      }
    }
    const next = this.next
    if (
      next != null &&
      next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName &&
      next.domNode.getAttribute('data-row-id') === this.domNode.getAttribute('data-row-id')
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
      const newChild = this.createDefaultChild(refBlot)
      newChild.appendChild(childBlot)
      childBlot = newChild
    }
    super.insertBefore(childBlot, refBlot)
  }

  replace(target: any) {
    if (target.statics.blotName !== this.statics.blotName) {
      const item = this.createDefaultChild()
      target.moveChildren(item, this)
      this.appendChild(item)
    }
    super.replace(target)
  }

  createDefaultChild(refBlot?: any) {
    let tableId = null
    if (refBlot) {
      tableId = refBlot.domNode.getAttribute('data-table-id')
    } else if (this.parent) {
      tableId = this.parent.domNode.getAttribute('data-table-id')
    } else {
      tableId = this.domNode.parent.getAttribute('data-table-id')
    }

    return Parchment.create(
      this.statics.defaultChild,
      [tableId, this.domNode.getAttribute('data-row-id'), TableTrick.random_id()].join('|'),
    )
  }
}

// TableRow.blotName = 'tr'
// TableRow.tagName = 'tr'
// TableRow.scope = Parchment.Scope.BLOCK_BLOT
// TableRow.defaultChild = 'th'
// TableRow.allowedChildren = [TableCell, TableHeader]

export default TableRow
