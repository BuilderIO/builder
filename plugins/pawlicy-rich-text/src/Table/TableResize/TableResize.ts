/* eslint-disable @typescript-eslint/restrict-plus-operands */
import defaultsDeep from 'lodash/defaultsDeep'
import { Quill } from 'react-quill'

import TableTrick from '../TableTrick'
import DefaultOptions from './DefaultOptions'
import { Resize } from './modules/Resize'
import { TableStyle } from './TableAttributors'

const knownModules: any = { Resize }

/**
 * Custom module for quilljs to allow user to resize <table> elements
 * Mostly borrowed from https://github.com/yanzongzhen/quill-image-resize-fix-module
 */
export default class TableResize {
  quill: any
  options: any
  modules: any
  moduleClasses: any
  table: any
  overlay: any

  constructor(quill: any, options: any = {}) {
    // save the quill reference and options
    this.quill = quill

    // Apply the options to our defaults, and stash them for later
    // defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
    let moduleClasses = false
    if (options.modules) {
      moduleClasses = options.modules.slice()
    }

    // Apply options to default options
    this.options = defaultsDeep({}, options, DefaultOptions)

    // (see above about moduleClasses)
    if (moduleClasses !== false) {
      this.options.modules = moduleClasses
    }

    // respond to clicks inside the editor
    this.quill.root.addEventListener('click', this.handleClick, false)

    this.quill.root.parentNode.style.position =
      this.quill.root.parentNode.style.position || 'relative'

    // setup modules
    this.moduleClasses = this.options.modules

    this.modules = []
  }

  initializeModules = () => {
    this.removeModules()

    this.modules = this.moduleClasses.map(
      (ModuleClass: any) => new (knownModules[ModuleClass] || ModuleClass)(this),
    )

    this.modules.forEach((module: any) => {
      module.onCreate()
    })

    this.onUpdate()
  }

  onUpdate = () => {
    this.repositionElements()
    this.modules.forEach((module: any) => {
      module.onUpdate()
    })
  }

  removeModules = () => {
    this.modules.forEach((module: any) => {
      module.onDestroy()
    })

    this.modules = []
  }

  handleClick = (evt: any) => {
    const table = TableTrick.findTable(this.quill)
    // if (evt.target && evt.target.tagName && (evt.target.tagName.toUpperCase() === 'table')) {
    if (table) {
      // if (this.table === evt.target) {
      if (this.table === table.domNode) {
        // we are already focused on this table
        return
      }
      if (this.table) {
        // we were just focused on another table
        this.hide()
      }
      // clicked on an table inside the editor
      this.show(table.domNode)
    } else if (this.table) {
      // clicked on a non table
      this.hide()
    }
  }

  show = (table: any) => {
    // keep track of this table element
    this.table = table

    this.showOverlay()

    this.initializeModules()
  }

  showOverlay = () => {
    if (this.overlay) {
      this.hideOverlay()
    }

    // this.quill.setSelection(null);

    // prevent spurious text selection
    this.setUserSelect('none')

    // listen for the table being deleted or moved
    document.addEventListener('keyup', this.checkTable, true)
    this.quill.root.addEventListener('input', this.checkTable, true)

    // Create and add the overlay
    this.overlay = document.createElement('div')
    Object.assign(this.overlay.style, this.options.overlayStyles)

    this.quill.root.parentNode.appendChild(this.overlay)

    this.repositionElements()
  }

  hideOverlay = () => {
    if (!this.overlay) {
      return
    }

    // Remove the overlay
    this.quill.root.parentNode.removeChild(this.overlay)
    this.overlay = undefined

    // stop listening for table deletion or movement
    document.removeEventListener('keyup', this.checkTable)
    this.quill.root.removeEventListener('input', this.checkTable)

    // reset user-select
    this.setUserSelect('')
  }

  repositionElements = () => {
    if (!this.overlay || !this.table) {
      return
    }

    // position the overlay over the table
    const parent = this.quill.root.parentNode
    const tableRect = this.table.getBoundingClientRect()
    const containerRect = parent.getBoundingClientRect()

    Object.assign(this.overlay.style, {
      left: `${tableRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${tableRect.top - containerRect.top + parent.scrollTop}px`,
      width: `${tableRect.width}px`,
      height: `${tableRect.height}px`,
    })
  }

  hide = () => {
    this.hideOverlay()
    this.removeModules()
    this.table = undefined
  }

  setUserSelect = (value: any) => {
    ;['userSelect', 'mozUserSelect', 'webkitUserSelect', 'msUserSelect'].forEach((prop: any) => {
      // set on contenteditable element and <html>
      this.quill.root.style[prop] = value
      document.documentElement.style[prop] = value
    })
  }

  checkTable = (evt: any) => {
    if (this.table) {
      if (evt.keyCode == 46 || evt.keyCode == 8) {
        Quill.find(this.table).deleteAt(0)
      }
      this.hide()
    }
  }
}
