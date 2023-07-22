/**
 * @author @kensnyder
 * @date 2018-07-17
 * @version 3.0.0
 * @url https://github.com/kensnyder/quill-image-resize-module
 * @file https://github.com/kensnyder/quill-image-resize-module/blob/master/src/ImageResize.js
 */

import defaultsDeep from 'lodash/defaultsDeep'
import Quill from 'quill'

import DefaultOptions from './DefaultOptions'
import { DisplaySize } from './Modules/DisplaySize'
import { Resize } from './Modules/Resize'
import { Toolbar } from './Modules/Toolbar'

const knownModules = { DisplaySize, Toolbar, Resize }

type Module = 'DisplaySize' | 'Toolbar' | 'Resize'

interface Options {
  modules?: Module[]
  overlayStyles?: Record<string, any>
  handleStyles?: Record<string, any>
  displayStyles?: Record<string, any>
  toolbarStyles?: Record<string, any>
  toolbarButtonStyles?: Record<string, any>
  toolbarButtonSvgStyles?: Record<string, any>
}

/**
 * Custom module for quilljs to allow user to resize <img> elements
 * (Works on Chrome, Edge, Safari and replaces Firefox's native resize behavior)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export class ImageResize {
  quill: Quill
  options: Options
  moduleClasses: Module[] | undefined = undefined
  modules: any[]
  img: HTMLImageElement | undefined = undefined
  overlay: HTMLDivElement | undefined = undefined
  constructor(quill: Quill, options: Options = {}) {
    // save the quill reference and options
    this.quill = quill

    // Apply the options to our defaults, and stash them for later
    // defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
    let moduleClasses = undefined
    if (options.modules) {
      moduleClasses = options.modules.slice()
    }

    // Apply options to default options
    this.options = defaultsDeep({}, options, DefaultOptions)

    // (see above about moduleClasses)
    if (moduleClasses !== undefined) {
      this.options.modules = moduleClasses
    }

    // disable native image resizing on firefox
    document.execCommand('enableObjectResizing', false, 'false')

    // respond to clicks inside the editor
    this.quill.root.addEventListener('click', this.handleClick, false)

    // this.quill.root.parentNode.style.position =
    //   this.quill.root.parentNode.style.position || 'relative'
    const positionValue =
      this.quill.root.parentElement?.style.getPropertyValue('position') || 'relative'
    this.quill.root.parentElement?.style.setProperty('position', positionValue)

    // setup modules
    this.moduleClasses = this.options.modules

    this.modules = []
  }

  initializeModules = () => {
    this.removeModules()

    // check this
    this.modules =
      this.moduleClasses instanceof Array
        ? this.moduleClasses.map(
            ModuleClass => new (knownModules[ModuleClass] || ModuleClass)(this),
          )
        : []

    this.modules.forEach(module => {
      module.onCreate()
    })

    this.onUpdate()
  }

  onUpdate = () => {
    this.repositionElements()
    this.modules.forEach(module => {
      module.onUpdate()
    })
  }

  removeModules = () => {
    this.modules.forEach(module => {
      module.onDestroy()
    })

    this.modules = []
  }

  handleClick = (evt: MouseEvent) => {
    if (
      evt.target instanceof HTMLImageElement &&
      evt.target &&
      evt.target.tagName &&
      evt.target.tagName.toUpperCase() === 'IMG'
    ) {
      if (this.img === evt.target) {
        // we are already focused on this image
        return
      }
      if (this.img) {
        // we were just focused on another image
        this.hide()
      }
      // clicked on an image inside the editor
      this.show(evt.target)
    } else if (this.img) {
      // clicked on a non image
      this.hide()
    }
  }

  // check this type
  show = (img: HTMLImageElement) => {
    // keep track of this img element
    this.img = img

    this.showOverlay()

    this.initializeModules()
  }

  showOverlay = () => {
    if (this.overlay) {
      this.hideOverlay()
    }

    this.quill.setSelection(0, 0)

    // prevent spurious text selection
    this.setUserSelect('none')

    // listen for the image being deleted or moved
    document.addEventListener('keyup', this.checkImage, true)
    this.quill.root.addEventListener('input', this.checkImage, true)

    // Create and add the overlay
    this.overlay = document.createElement('div')
    Object.assign(this.overlay.style, this.options.overlayStyles)

    this.quill.root.parentNode?.appendChild(this.overlay)

    this.repositionElements()
  }

  hideOverlay = () => {
    if (!this.overlay) {
      return
    }

    // Remove the overlay
    this.quill.root.parentNode?.removeChild(this.overlay)
    this.overlay = undefined

    // stop listening for image deletion or movement
    document.removeEventListener('keyup', this.checkImage)
    this.quill.root.removeEventListener('input', this.checkImage)

    // reset user-select
    this.setUserSelect('')
  }

  repositionElements = () => {
    if (!this.overlay || !this.img) {
      return
    }

    // position the overlay over the image
    // const parent = this.quill.root.parentNode
    const parent = this.quill.root.parentElement
    const imgRect = this.img.getBoundingClientRect()
    // const containerRect = parent.getBoundingClientRect()
    const containerRect = this.quill.root.parentElement?.getBoundingClientRect()

    Object.assign(this.overlay.style, {
      left: `${imgRect.left - (containerRect?.left || 0) - 1 + (parent?.scrollLeft || 0)}px`,
      top: `${imgRect.top - (containerRect?.top || 0) + (parent?.scrollTop || 0)}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
    })
  }

  hide = () => {
    this.hideOverlay()
    this.removeModules()
    this.img = undefined
  }

  setUserSelect = (value: string) => {
    ;['userSelect', 'mozUserSelect', 'webkitUserSelect', 'msUserSelect'].forEach(prop => {
      // set on contenteditable element and <html>
      // this.quill.root.style[prop] = value
      // document.documentElement.style[prop] = value
      this.quill.root.style.setProperty(prop, value)
      document.documentElement.style.setProperty(prop, value)
    })
  }

  checkImage = (evt: CheckImageEvent) => {
    if (this.img) {
      if (evt instanceof KeyboardEvent && (evt.keyCode == 46 || evt.keyCode == 8)) {
        Quill.find(this.img).deleteAt(0)
      }
      this.hide()
    }
  }
}

type CheckImageEvent = KeyboardEvent | Event
