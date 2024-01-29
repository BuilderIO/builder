/**
 * Inspired by
 * @author sawasawasawa
 * @version 1.0.0
 * @url https://github.com/sawasawasawa/quill-table
 */

/* eslint-disable @typescript-eslint/restrict-plus-operands */
import './css/quill.table.css'

import * as QuillType from 'quill'
// import Quill from 'quill'
import Delta from 'quill-delta'
import { Quill } from 'react-quill'

import { Colspan } from './Attributes/Colspan'
import { Column } from './Attributes/Column'
import { Rowspan } from './Attributes/Rowspan'
import { CellAttributes } from './CelAttributes'
import Contain from './ContainBlot'
import Table from './TableBlot'
import TableBody from './TableBodyBlot'
import TableCell from './TableCellBlot'
import TableHead from './TableHeadBlot'
import TableHeader from './TableHeaderBlot'
import TableRow from './TableRowBlot'
import tableToolbar from './tableToolbar'
import TableTrick from './TableTrick'

const Container = Quill.import('blots/container')

Container.order = [
  'list',
  'contain', // Must be lower
  'td',
  'tr',
  'table', // Must be higher
]

type AttributesTypes = 'td' | 'th' | 'class' | 'colspan' | 'rowspan' | 'column'

type Attributes = Partial<Record<AttributesTypes, any>>

class TableModule {
  quill: QuillType.Quill

  static register() {
    // console.log('register table module')
    Quill.register(TableCell)
    Quill.register(TableHeader)
    Quill.register(TableRow)
    Quill.register(Table)
    Quill.register(TableBody)
    Quill.register(TableHead)
    Quill.register(Colspan)
    Quill.register(Rowspan)
    Quill.register(Column)
    // Quill.register(Contain);
  }

  constructor(quill: QuillType.Quill, options: {}) {
    this.quill = quill
    const toolbar = quill.getModule('toolbar')
    toolbar.addHandler('table', function (value: any) {
      return TableTrick.table_handler(value, quill)
    })

    toolbar.addHandler('table-border', function (value: any) {
      return TableTrick.table_handler(value, quill)
    })

    toolbar.addHandler('table-color', function (value: any) {
      return TableTrick.table_handler(value, quill)
    })

    const clipboard = quill.getModule('clipboard')
    // clipboard.addMatcher('TABLE', function (node, delta) {
    //   const randomTable = Math.random().toString(36).slice(2)
    //   return delta
    // })
    clipboard.addMatcher('TR', function (node: HTMLElement, delta: Delta) {
      const hasTH = delta.filter(
        op =>
          op.attributes !== undefined &&
          typeof op.attributes === 'object' &&
          op.attributes.th !== undefined,
      )
      const randomRow = Math.random().toString(36).slice(2)

      const newDelta = delta.reduce((newDelta: Delta, op: any, index: number) => {
        const defaultCellAttributes =
          op && op.attributes && op.attributes.td ? op.attributes.td : op.attributes.th

        let cellAttributes: CellAttributes = {}

        if (typeof defaultCellAttributes === 'object') {
          cellAttributes = {
            ...defaultCellAttributes,
            rowId: randomRow,
          }
        }

        if (cellAttributes.cellId === undefined)
          cellAttributes.cellId = Math.random().toString(36).slice(2)

        const colspan = op && op.attributes && op.attributes.colspan ? op.attributes.colspan : null
        const rowspan = op && op.attributes && op.attributes.rowspan ? op.attributes.rowspan : null
        const column = op && op.attributes && op.attributes.column ? op.attributes.column : null
        const cellClass = op && op.attributes && op.attributes.class ? op.attributes.class : null
        // console.log('op', op, index, colspan, cellClass)

        if (colspan !== null) cellAttributes.colspan = colspan
        if (rowspan !== null) cellAttributes.rowspan = rowspan
        if (column !== null) cellAttributes.column = column
        if (cellClass !== null) cellAttributes.cellClass = cellClass

        const attributeString = cellAttributes

        if (hasTH.length > 0) {
          if (op.attributes) {
            op.attributes['th'] = attributeString
          } else {
            op.attributes = {
              th: attributeString,
            }
          }
        } else {
          if (op.attributes) {
            op.attributes['td'] = attributeString
          } else {
            op.attributes = {
              td: attributeString,
            }
          }
        }

        // newDelta.push(op)
        newDelta.insert(op.insert, op.attributes)
        return newDelta
      }, new Delta())

      // console.log('newDelta', newDelta)
      return newDelta
    })
    clipboard.addMatcher('TD', function (node: HTMLElement, delta: Delta) {
      const cellAttributes: CellAttributes = {
        cellId: Math.random().toString(36).slice(2),
      }
      const attributes: Attributes = {
        td: cellAttributes,
        class: node.className,
      }
      if (node.getAttribute('colspan')) {
        attributes['colspan'] = node.getAttribute('colspan') || 'null'
      }
      if (node.getAttribute('rowspan')) {
        attributes['rowspan'] = node.getAttribute('rowspan') || 'null'
      }
      if (node.getAttribute('column')) {
        attributes['column'] = node.getAttribute('column') || 'null'
      }

      if (!deltaEndsWith(delta, '\n')) {
        const newDelta = delta.compose(
          new Delta().retain(delta.length(), attributes).insert('\n', attributes),
        )
        return newDelta
      }
      const newDelta = delta.compose(new Delta().retain(delta.length(), attributes))
      return newDelta
    })
    clipboard.addMatcher('TH', function (node: HTMLElement, delta: Delta) {
      const cellAttributes: CellAttributes = {
        cellId: Math.random().toString(36).slice(2),
      }
      const attributes: Attributes = {
        th: cellAttributes,
        class: node.className,
      }
      if (node.getAttribute('colspan')) {
        attributes['colspan'] = node.getAttribute('colspan') || 'null'
      }
      if (node.getAttribute('rowspan')) {
        attributes['rowspan'] = node.getAttribute('rowspan') || 'null'
      }
      if (node.getAttribute('column')) {
        attributes['column'] = node.getAttribute('column') || 'null'
      }

      if (!deltaEndsWith(delta, '\n')) {
        return delta.compose(
          new Delta().retain(delta.length(), attributes).insert('\n', attributes),
        )
      }
      return delta.compose(new Delta().retain(delta.length(), attributes))
    })
  }
}

const deltaEndsWith = function (delta: Delta, text: string) {
  let endText = ''
  for (let i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
    const op = delta.ops[i]
    if (typeof op.insert !== 'string') break
    endText = op.insert + endText
  }
  return endText.slice(-1 * text.length) === text
}

export { Contain, Table, TableCell, TableModule, TableRow, tableToolbar }
