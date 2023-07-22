import { Quill } from 'react-quill'

import ContainBlot from './ContainBlot'
import TableRow from './TableRowBlot'
import TableTrick from './TableTrick'

const Container = Quill.import('blots/container')
const Parchment = Quill.import('parchment')
const Block = Quill.import('blots/block')

class TableHead extends Container {
  static blotName = 'thead'
  static tagName = 'thead'
  static scope = Parchment.Scope.BLOCK_BLOT
  static defaultChild = 'tr'
  static allowedChildren = [TableRow]

  static create(value: string) {
    const tagName = 'thead'
    const node = super.create(tagName)
    // node.setAttribute('table_id', value);
    // node.setAttribute('id', value);

    // node.setAttribute('table_id', TableTrick.random_id());
    // node.setAttribute('id', TableTrick.random_id());
    // const table = document.getElementById(value)
    // const tableWidthToSet = window.tableWidth

    // if (table && tableWidthToSet) {
    //   table.style.width = window.tableWidth
    //   window.tableWidth = null
    // }

    return node
  }

  format() {
    this.getAttribute('table_id')
  }

  optimize(context: any) {
    super.optimize(context)
    const next = this.next
    if (
      next != null &&
      next.prev === this &&
      next.statics.blotName === this.statics.blotName &&
      next.domNode.tagName === this.domNode.tagName &&
      next.domNode.getAttribute('table_id') === this.domNode.getAttribute('table_id')
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
      const newChild = Parchment.create(this.statics.defaultChild, TableTrick.random_id())
      newChild.appendChild(childBlot)
      childBlot = newChild
    }
    super.insertBefore(childBlot, refBlot)
  }
}

export default TableHead
