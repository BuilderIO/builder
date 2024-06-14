/* eslint-disable no-undef */
import { Quill } from 'react-quill'

import { iconMap } from './IconList'

const Embed = Quill.import('blots/embed')
class PawlicyBlot extends Embed {
  static create(value: any) {
    const node = super.create()
    if (typeof value === 'object') {
      PawlicyBlot.buildSpan(value, node)
    } else if (typeof value === 'string') {
      const valueObj = iconMap[value]
      if (valueObj) {
        PawlicyBlot.buildSpan(valueObj, node)
      }
    }

    return node
  }

  static buildSpan(value: any, node: any) {
    node.setAttribute('data-name', value.item.name)

    const iconSpan = document.createElement('span')
    iconSpan.classList.add(this.iconClass)
    iconSpan.classList.add(`${this.iconPrefix}${value.item.name}`)

    iconSpan.innerText = ''
    node.appendChild(iconSpan)
  }

  static value(node: any) {
    return node.dataset.name
  }
}
PawlicyBlot.blotName = 'pawlicyicon'
PawlicyBlot.className = 'ql-pawlicyblot'
PawlicyBlot.tagName = 'span'
PawlicyBlot.iconClass = 'icon'
PawlicyBlot.iconPrefix = 'icon-'

export { PawlicyBlot }
