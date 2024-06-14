import { Quill } from 'react-quill'

const Inline = Quill.import('blots/inline')
class StyleTagBlot extends Inline {
  static blotName = 'styletag'
  static tagName = 'style'

  static create(value: string) {
    const node = super.create()

    return node
  }

  static value(node: HTMLElement) {
    return node
  }
}

export { StyleTagBlot }
