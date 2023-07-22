/**
 * Inspired by
 * @author contentco
 * @version 0.2.1
 * @url https://github.com/contentco/quill-emoji
 */

/* eslint-disable @typescript-eslint/restrict-plus-operands */
import Fuse from 'fuse.js'
import { Quill as QuillType, RangeStatic } from 'quill'
import { Quill } from 'react-quill'

import { iconList, iconType } from './IconList'
import { PawlicyBlot } from './PawlicyBlot'

const Module = Quill.import('core/module')

interface PawlicyToolbarOptions {
  buttonIcon: string
}

class PawlicyToolbar extends Module {
  quill: QuillType
  constructor(quill: QuillType, options: PawlicyToolbarOptions) {
    super(quill, options)
    this.quill = quill
    this.options = options

    this.toolbar = quill.getModule('toolbar')
    if (typeof this.toolbar !== 'undefined') {
      this.toolbar.addHandler('pawlicyicons', this.handleClick.bind(this))
    }
    const iconButton = document.getElementsByClassName('ql-pawlicyicons')
    if (iconButton) {
      Array.from(iconButton).forEach(function (iconBtn) {
        iconBtn.innerHTML = options.buttonIcon
      })
    }

    this.quill.on('text-change', function (delta, oldDelta, source) {
      if (source === 'user') {
        fn_close()
      }
    })
  }

  handleClick() {
    const quill = this.quill
    fn_checkDialogOpen(quill)
  }
}

function fn_checkDialogOpen(quill: QuillType) {
  const elementExists = document.getElementById('icon-palette')
  if (elementExists) {
    elementExists.remove()
  } else {
    fn_showIconPalette(quill)
  }
}

function fn_showIconPalette(quill: any) {
  const ele_icon_area = document.createElement('div')
  const selection = quill.getSelection()
  const selectionBounds = quill.getBounds(selection?.index || 0)

  const paletteLeft = 0
  const paletteTop = selectionBounds.top + 10

  quill.container.appendChild(ele_icon_area)
  ele_icon_area.id = 'icon-palette'
  ele_icon_area.style.left = `${paletteLeft}px`
  ele_icon_area.style.top = `${paletteTop}px`

  const tabToolbar = document.createElement('div')
  tabToolbar.id = 'tab-toolbar'
  ele_icon_area.appendChild(tabToolbar)

  //panel
  const panel = document.createElement('div')
  panel.id = 'tab-panel'
  ele_icon_area.appendChild(panel)

  const tabElementHolder = document.createElement('ul')
  tabToolbar.appendChild(tabElementHolder)

  // close background overlay
  const iconClose = document.getElementById('icon-close-div')
  if (iconClose === null) {
    const closeDiv = document.createElement('div')
    closeDiv.id = 'icon-close-div'
    closeDiv.addEventListener('click', fn_close, false)
    document.getElementsByTagName('body')[0].appendChild(closeDiv)
  } else {
    iconClose.style.display = 'block'
  }

  iconType.forEach(function (iconType) {
    //add tab bar
    const tabElement = document.createElement('li')
    tabElement.classList.add('icon-tab')
    tabElement.classList.add('filter-' + iconType.name)
    tabElement.innerHTML = iconType.content
    tabElement.dataset.filter = iconType.type
    tabElementHolder.appendChild(tabElement)

    const iconFilter = document.querySelector<HTMLElement>('.filter-' + iconType.name)
    if (iconFilter) {
      iconFilter.addEventListener('click', function () {
        const tab = document.querySelector('.active')
        if (tab) {
          tab.classList.remove('active')
        }
        iconFilter.classList.toggle('active')
        fn_updateIconContainer(iconFilter, panel, quill)
      })
    }
  })
  fn_iconPanelInit(panel, quill)
}

function fn_iconPanelInit(panel: HTMLDivElement, quill: QuillType) {
  fn_iconElementsToPanel('interface', panel, quill)
  const defaultTab = document.querySelector('.filter-interface')
  if (defaultTab) {
    defaultTab.classList.add('active')
  }
}

function fn_iconElementsToPanel(type: string, panel: HTMLDivElement, quill: QuillType) {
  const fuseOptions = {
    shouldSort: true,
    matchAllTokens: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: ['category'],
  }

  const fuse = new Fuse(iconList, fuseOptions)
  const result = fuse.search(type)
  result.sort(function (a, b) {
    return a.item.icon_order - b.item.icon_order
  })

  quill.focus()

  const range = quill.getSelection() || { index: 0, length: 0 }

  result.forEach(function (icon) {
    const span = document.createElement('span')
    // const t = document.createTextNode(icon.item.shortname)
    // span.appendChild(t)
    span.classList.add('bem')
    span.classList.add('bem-' + icon.item.name)
    span.classList.add('icon')
    span.classList.add('icon-' + icon.item.name)

    span.innerHTML = ''
    panel.appendChild(span)

    const customButton = document.querySelector('.bem-' + icon.item.name)
    if (customButton) {
      customButton.addEventListener('click', function () {
        quill.insertEmbed(range.index, 'pawlicyicon', icon, 'user')
        setTimeout(() => quill.setSelection(range.index + 1, 0), 0)
        fn_close()
      })
    }
  })
}

function fn_updateIconContainer(iconFilter: HTMLElement, panel: HTMLDivElement, quill: QuillType) {
  while (panel.firstChild) {
    panel.removeChild(panel.firstChild)
  }
  const type = iconFilter.dataset.filter || ''
  fn_iconElementsToPanel(type, panel, quill)
}

function fn_close() {
  const ele_icon_plate = document.getElementById('icon-palette')
  const closeDiv = document.getElementById('icon-close-div')
  if (closeDiv) {
    closeDiv.style.display = 'none'
  }
  if (ele_icon_plate) {
    ele_icon_plate.remove()
  }
}

PawlicyToolbar.DEFAULTS = {
  buttonIcon: '<span class="toolbar-icon icon-pawlicy" />',
}

export { PawlicyBlot, PawlicyToolbar }
