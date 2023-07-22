import { BaseModule } from './BaseModule'

export class Resize extends BaseModule {
  boxes: any
  dragBox: any
  dragStartX: any
  preDragWidth: any

  onCreate = () => {
    // track resize handles
    this.boxes = []

    // add 4 resize handles
    this.addBox('nwse-resize') // top left
    this.addBox('nesw-resize') // top right
    this.addBox('nwse-resize') // bottom right
    this.addBox('nesw-resize') // bottom left

    this.positionBoxes()
  }

  onDestroy = () => {
    // reset drag handle cursors
    this.setCursor('')
  }

  positionBoxes = () => {
    const handleXOffset = `${-parseFloat(this.options.handleStyles.width) / 2}px`
    const handleYOffset = `${-parseFloat(this.options.handleStyles.height) / 2}px`

    // set the top and left for each drag handle
    ;[
      { left: handleXOffset, top: handleYOffset }, // top left
      { right: handleXOffset, top: handleYOffset }, // top right
      { right: handleXOffset, bottom: handleYOffset }, // bottom right
      { left: handleXOffset, bottom: handleYOffset }, // bottom left
    ].forEach((pos, idx) => {
      Object.assign(this.boxes[idx].style, pos)
    })
  }

  addBox = (cursor: any) => {
    // create div element for resize handle
    const box = document.createElement('div')

    // Star with the specified styles
    Object.assign(box.style, this.options.handleStyles)
    box.style.cursor = cursor

    // Set the width/height to use 'px'
    box.style.width = `${this.options.handleStyles.width}px`
    box.style.height = `${this.options.handleStyles.height}px`

    // listen for mousedown on each box
    box.addEventListener('mousedown', this.handleMousedown, false)
    // add drag handle to document
    this.overlay.appendChild(box)
    // keep track of drag handle
    this.boxes.push(box)
  }

  handleMousedown = (evt: any) => {
    // note which box
    this.dragBox = evt.target
    // note starting mousedown position
    this.dragStartX = evt.clientX
    // store the width before the drag
    this.preDragWidth = this.table.style.width || this.table.offsetWidth
    // set the proper cursor everywhere
    this.setCursor(this.dragBox.style.cursor)
    // listen for movement and mouseup
    document.addEventListener('mousemove', this.handleDrag, false)
    document.addEventListener('mouseup', this.handleMouseup, false)
  }

  handleMouseup = () => {
    // reset cursor everywhere
    this.setCursor('')
    // stop listening for movement and mouseup
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.handleMouseup)
  }

  handleDrag = (evt: any) => {
    if (!this.table) {
      // table not set yet
      return
    }
    // update table size
    const deltaX = evt.clientX - this.dragStartX
    if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
      // left-side resize handler; dragging right shrinks table
      this.table.style.width = `${Math.round(parseInt(this.preDragWidth) - deltaX)}px`
    } else {
      // right-side resize handler; dragging right enlarges table
      this.table.style.width = `${Math.round(parseInt(this.preDragWidth) + deltaX)}px`
    }
    this.requestUpdate()
  }

  setCursor = (value: any) => {
    ;[document.body, this.table].forEach(el => {
      if (el && el.style) {
        el.style.cursor = value // eslint-disable-line no-param-reassign
      }
    })
  }
}
