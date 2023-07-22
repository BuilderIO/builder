/**
 * @author @kensnyder
 * @date 2018-07-17
 * @version 3.0.0
 * @url https://github.com/kensnyder/quill-image-resize-module
 * @file https://github.com/kensnyder/quill-image-resize-module/blob/master/src/modules/DisplaySize.js
 */

/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseModule } from './BaseModule'

export class DisplaySize extends BaseModule {
  display: HTMLDivElement | null = null
  onCreate = () => {
    // Create the container to hold the size display
    this.display = document.createElement('div')

    // Apply styles
    Object.assign(this.display.style, this.options.displayStyles)

    // Attach it
    this.overlay.appendChild(this.display)
  }

  onDestroy = () => {}

  onUpdate = () => {
    if (!this.display || !this.img) {
      return
    }

    const size = this.getCurrentSize()
    this.display.innerHTML = size.join(' &times; ')
    if (size[0] > 120 && size[1] > 30) {
      // position on top of image
      Object.assign(this.display.style, {
        right: '4px',
        bottom: '4px',
        left: 'auto',
      })
    } else if (this.img.style.float == 'right') {
      // position off bottom left
      const dispRect = this.display.getBoundingClientRect()
      Object.assign(this.display.style, {
        right: 'auto',
        bottom: `-${dispRect.height + 4}px`,
        left: `-${dispRect.width + 4}px`,
      })
    } else {
      // position off bottom right
      const dispRect = this.display.getBoundingClientRect()
      Object.assign(this.display.style, {
        right: `-${dispRect.width + 4}px`,
        bottom: `-${dispRect.height + 4}px`,
        left: 'auto',
      })
    }
  }

  getCurrentSize = () => [
    this.img.width,
    Math.round((this.img.width / this.img.naturalWidth) * this.img.naturalHeight),
  ]
}
