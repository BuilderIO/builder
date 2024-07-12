/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Quill } from 'react-quill'

import TableCell from './TableCellBlot'

const Parchment = Quill.import('parchment')
const Container = Quill.import('blots/container')
const Scroll = Quill.import('blots/scroll')

export default class TableTrick {
  static random_id() {
    return Math.random().toString(36).slice(2)
  }

  static getSelectedTd(quill: any) {
    const selection = quill.getSelection()
    if (!selection) {
      return null
    }
    const leaf = quill.getLeaf(quill.getSelection()['index'])
    let blot = leaf[0]
    for (; blot != null && blot.statics.blotName != 'td'; ) {
      blot = blot.parent
    }
    return blot // return TD or NULL
  }

  static getContainingTable(td: any) {
    return td && td.parent && td.parent.parent
  }

  static findTable(quill: any) {
    const cell = TableTrick.getSelectedTd(quill)
    if (cell) {
      return TableTrick.getContainingTable(cell)
    }
    return null
  }

  static updateColumnNumbers(quill: any) {
    const table = TableTrick.findTable(quill)
    const rows = table.domNode.querySelectorAll(`tr`)
    rows.forEach((row: any) => {
      const cells = row.querySelectorAll('td')
      cells.forEach((cell: any, i: any) => cell.setAttribute('column', i + 1))
    })
  }

  static resetGridBorders(table: any) {
    if (table) {
      table.domNode.classList.remove('table-border-outline')
      table.domNode.classList.remove('table-border-none')
    }
  }

  static getCell(quill: any) {
    const range = quill.getSelection()
    if (range == null) return null
    const [cell, offset] = quill.getLine(range.index)
    return cell.parent
  }

  static table_handler(value: any, quill: any) {
    if (value.includes('newtable_')) {
      let node = null
      const sizes = value.split('_')
      const row_count = Number.parseInt(sizes[1])
      const col_count = Number.parseInt(sizes[2])
      const table_id = TableTrick.random_id()
      const table = Parchment.create('table', table_id)
      for (let ri = 0; ri < row_count; ri++) {
        const row_id = TableTrick.random_id()
        const tr = Parchment.create('tr', row_id)
        table.appendChild(tr)
        for (let ci = 0; ci < col_count; ci++) {
          const cell_id = TableTrick.random_id()
          const colspan = 1
          const color = 'white'
          const value =
            table_id + '|' + row_id + '|' + cell_id + '|' + (ci + 1) + '|' + color + '|' + colspan
          const td = Parchment.create('td', value)
          tr.appendChild(td)
          const p = Parchment.create('block')
          td.appendChild(p)
          const br = Parchment.create('break')
          p.appendChild(br)
          node = p
        }
      }
      const leaf = quill.getLeaf(quill.getSelection()['index'])
      let blot = leaf[0]
      let top_branch = null
      for (; blot != null && !(blot instanceof Container || blot instanceof Scroll); ) {
        top_branch = blot
        blot = blot.parent
      }
      blot.insertBefore(table, top_branch)
      return node
    } else if (value === 'append-col') {
      const td = TableTrick.getSelectedTd(quill)
      const { index, length } = quill.getSelection()

      if (td) {
        const columnNumber = parseInt(TableTrick.getCell(quill).domNode.getAttribute('column'))
        const table = td.parent.parent
        const table_id = table.domNode.getAttribute('table_id')
        table.children.forEach(function (tr: any) {
          const row_id = tr.domNode.getAttribute('row_id')
          const cell_id = TableTrick.random_id()
          const td = Parchment.create(
            'td',
            table_id + '|' + row_id + '|' + cell_id + '|' + columnNumber + '|white|1',
          )
          const nextColumnBlot = tr.children
            .map((c: any) => {
              if (parseInt(c.domNode.getAttribute('column')) === columnNumber + 1) {
                return c
              }
            })
            .filter((c: any) => !!c)[0]
          if (nextColumnBlot) {
            tr.insertBefore(td, nextColumnBlot)
          } else {
            tr.appendChild(td)
          }
        })
      }
      TableTrick.updateColumnNumbers(quill)
      quill.setSelection(index, length)
    } else if (value === 'append-row') {
      const td = TableTrick.getSelectedTd(quill)
      if (td) {
        const currentRow = td.parent
        const table = td.parent.parent
        const newRow = Parchment.create('tr')
        const nextRow = td.parent.next
        const table_id = table.domNode.getAttribute('table_id')
        const row_id = TableTrick.random_id()
        newRow.domNode.setAttribute('row_id', row_id)
        currentRow.children.forEach((cell: any, i: any) => {
          const cell_id = TableTrick.random_id()
          const colspan = cell.domNode.getAttribute('colspan')
          const td = Parchment.create(
            'td',
            table_id + '|' + row_id + '|' + cell_id + '|' + i + '|white|' + colspan,
          )
          newRow.appendChild(td)
          const p = Parchment.create('block')
          td.appendChild(p)
          const br = Parchment.create('break')
          p.appendChild(br)
        })
        if (nextRow) {
          table.insertBefore(newRow, nextRow)
        } else {
          table.appendChild(newRow)
        }
        TableTrick.updateColumnNumbers(quill)
      }
    } else if (value === 'delete-col') {
      const cell = this.getCell(quill)
      const columnNumber = cell.domNode.getAttribute('column')
      const tableId = cell.domNode.getAttribute('table_id')
      const columnSelector = `td[table_id='${tableId}'][column='${columnNumber}']`
      const colCells = document.querySelectorAll(columnSelector)
      console.log('_______ colCells', colCells)
      // debugger
      colCells.forEach(td => {
        // This handles reducing colspan of a merged cell only if delete
        // was fired on a cell STARTING at the same column as the merged cell
        // TODO it should also reduce colspan, when delete is fired on other cells
        // that are located under the merged one.
        const colspan = td.getAttribute('colspan')
        if (colspan && colspan?.length > 1) {
          const newColspan = parseInt(colspan) - 1
          td.setAttribute('colspan', `${newColspan}`)
        } else {
          td.remove()
        }
      })
      TableTrick.updateColumnNumbers(quill)
    } else if (value === 'delete-row') {
      const cell = this.getCell(quill)
      cell.parent.domNode.remove()
    } else if (value === 'border-none') {
      const table = TableTrick.findTable(quill)
      if (table) {
        this.resetGridBorders(table)
        table.domNode.classList.add('table-border-none')
      }
    } else if (value === 'merge') {
      const { index, length } = quill.getSelection()
      const firstElement = quill.getLeaf(index)[0].parent.parent
      const firstElementId = firstElement.domNode.getAttribute('cell_id')
      const firstCellRow = firstElement.domNode.getAttribute('row_id')
      const cellsToRemoveMap: any = {}
      for (let i = 0; i < length + 1; i++) {
        const td = quill.getLeaf(index + i)[0].parent.parent
        if (td instanceof TableCell) {
          const cellId = td.domNode.getAttribute('cell_id')
          const cellRow = td.domNode.getAttribute('row_id')
          if (cellId !== firstElementId && cellRow === firstCellRow) {
            cellsToRemoveMap[cellId] = td
          }
        }
      }
      const cellsToRemove = Object.values(cellsToRemoveMap)
      const totalColspan = [firstElement, ...cellsToRemove]
        .map(td => {
          return document.body.contains(td.domNode)
            ? parseInt(td.domNode.getAttribute('colspan'))
            : 0
        })
        .reduce((a, b) => a + b)
      firstElement.domNode.setAttribute('colspan', `${totalColspan}`)
      cellsToRemove.forEach((cell: any) => cell.remove())
      TableTrick.updateColumnNumbers(quill)
      quill.setSelection(index, length)
    } else if (value === 'border-outline') {
      const table = TableTrick.findTable(quill)
      if (table) {
        this.resetGridBorders(table)
        table.domNode.classList.add('table-border-outline')
      }
    } else if (value === 'border-grid') {
      const table = TableTrick.findTable(quill)
      if (table) {
        this.resetGridBorders(table)
      }
    } else if (value.startsWith('#')) {
      const currentElement = TableTrick.getSelectedTd(quill)
      const { index, length } = quill.getSelection()
      for (let i = 0; i < length; i++) {
        const td = quill.getLeaf(index + i)[0].parent.parent
        if (td instanceof TableCell) {
          td.domNode.style.backgroundColor = value
          td.domNode.setAttribute('color', value)
        }
      }
      currentElement.domNode.style.backgroundColor = value
    } else {
      const table_id = TableTrick.random_id()
      const table = Parchment.create('table', table_id)

      const leaf = quill.getLeaf(quill.getSelection()['index'])
      let blot = leaf[0]
      let top_branch = null
      for (; blot != null && !(blot instanceof Container || blot instanceof Scroll); ) {
        top_branch = blot
        blot = blot.parent
      }
      blot.insertBefore(table, top_branch)
      return table
    }
  }
}
